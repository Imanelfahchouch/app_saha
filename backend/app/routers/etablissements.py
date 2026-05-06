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
        # On compare avec la valeur de l'enum (ex: 'hopital')
        query = query.filter(Establishment.type == type)

    # 2. Filtre par recherche (Nom ou Adresse)
    if search:
        # Utilisation de ILIKE pour la recherche insensible à la casse
        query = query.filter(
            (Establishment.nom.ilike(f"%{search}%")) | 
            (Establishment.adresse.ilike(f"%{search}%"))
        )

    # 3. Exécution et formatage
    results = query.all()

    # Conversion des objets SQL en Dictionnaires JSON pour le Frontend
    return [
    {
        "id": item.id,
        "nom": item.nom,
        "type": item.type.value,
        "adresse": item.adresse,
        "latitude": float(item.latitude or 33.5731),
        "longitude": float(item.longitude or -7.5898),
        "etat": item.etat.value,
        "rating": 0,      # Sera calculé plus tard depuis la table reviews
        "reviews": 0,     # Idem
        "distance": None  # Sera calculé côté frontend via formule Haversine
    }
    for item in results
]