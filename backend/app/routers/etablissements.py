from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Establishment

router = APIRouter()

@router.get("/etablissements")
def get_etablissements(
    db: Session = Depends(get_db),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Récupère la liste des établissements avec des filtres optionnels.
    """
    query = db.query(Establishment)

    # 1. Filtre par type (pharmacie, clinique, hopital)
    if type:
        query = query.filter(Establishment.type == type)

    # 2. Filtre par recherche (Nom ou Adresse)
    if search:
        query = query.filter(
            (Establishment.nom.ilike(f"%{search}%")) | 
            (Establishment.adresse.ilike(f"%{search}%"))
        )

    # 3. Exécution et formatage
    results = query.all()

    return [
    {
        "id": item.id,
        "nom": item.nom,
        "type": item.type.value,
        "adresse": item.adresse,
        "latitude": float(item.latitude or 33.5731),
        "longitude": float(item.longitude or -7.5898),
        "etat": item.etat.value,
        "rating": 0,
        "reviews": 0,
        "distance": None
    }
    for item in results
]

@router.get("/etablissements/nearby")
def get_nearby_etablissements(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: int = Query(5000, ge=100, le=50000),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    from sqlalchemy import func

    # Points en geometry 4326 (longitude, latitude)
    user_point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
    etab_point = func.ST_SetSRID(func.ST_MakePoint(Establishment.longitude, Establishment.latitude), 4326)

    # ST_DistanceSphere retourne TOUJOURS des MÈTRES
    dist = func.ST_DistanceSphere(etab_point, user_point).label("dist_meters")

    query = db.query(Establishment, dist).filter(dist <= radius)

    if type:
        query = query.filter(Establishment.type == type)

    results = query.order_by("dist_meters").all()

    return [
        {
            "id": item.Establishment.id,
            "nom": item.Establishment.nom,
            "type": item.Establishment.type.value if hasattr(item.Establishment.type, 'value') else item.Establishment.type,
            "adresse": item.Establishment.adresse,
            "latitude": float(item.Establishment.latitude or 33.5731),
            "longitude": float(item.Establishment.longitude or -7.5898),
            "etat": item.Establishment.etat.value if hasattr(item.Establishment.etat, 'value') else item.Establishment.etat,
            "rating": 0,
            "reviews": 0,
            "distance": round(item.dist_meters, 1)
        }
        for item in results
    ]