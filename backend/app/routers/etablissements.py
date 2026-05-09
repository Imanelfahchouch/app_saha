from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Establishment, Review, User
from typing import Optional, List
from datetime import datetime
import re

def get_dynamic_status(hours_str: str) -> str:
    """Calcule si l'établissement est ouvert ou fermé selon l'heure actuelle."""
    if not hours_str or "24h" in hours_str:
        return "ouvert"
        
    now = datetime.now()
    current_time = now.hour + now.minute / 60.0
    
    match = re.search(r'(\d{1,2})[h:](\d{2})\s*-\s*(\d{1,2})[h:](\d{2})', hours_str)
    if match:
        h1, m1, h2, m2 = map(int, match.groups())
        start = h1 + m1 / 60.0
        end = h2 + m2 / 60.0
        return "ouvert" if start <= current_time <= end else "ferme"
        
    return "ouvert"

router = APIRouter()

@router.get("/etablissements")
def get_all(
    db: Session = Depends(get_db),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(Establishment)
    if type: query = query.filter(Establishment.type == type)
    if search:
        query = query.filter(
            (Establishment.nom.ilike(f"%{search}%")) | 
            (Establishment.adresse.ilike(f"%{search}%"))
        )
    results = query.all()
    output = []
    for etab in results:
        avg = db.query(func.avg(Review.rating)).filter(Review.etablissement_id == etab.id).scalar()
        count = db.query(func.count(Review.id)).filter(Review.etablissement_id == etab.id).scalar()
        type_val = etab.type.value if hasattr(etab.type, 'value') else etab.type
        etat_val = etab.etat.value if hasattr(etab.etat, 'value') else etab.etat
        output.append({
            "id": etab.id, "nom": etab.nom, "type": type_val, "adresse": etab.adresse,
            "latitude": float(etab.latitude) if etab.latitude else 0.0,
            "longitude": float(etab.longitude) if etab.longitude else 0.0,
            "etat": etat_val, "phone": etab.phone, "hours": etab.opening_hours,
            "rating": round(float(avg), 1) if avg else 0.0, "reviews": count or 0
        })
    return output

# ✅ ROUTE /nearby REMPLACÉE (formule Haversine - compatible PostgreSQL standard)
@router.get("/etablissements/nearby")
def get_nearby_etablissements(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: int = Query(5000, ge=100, le=50000),
    type: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Retourne les établissements dans un rayon donné (formule de Haversine).
    Compatible PostgreSQL standard (sans PostGIS).
    """
    from sqlalchemy import text

    # Formule de Haversine en SQL pur (rayon Terre = 6371 km) → distance en MÈTRES
    haversine = """
        (6371 * acos(
            cos(radians(:lat)) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(:lng)) + 
            sin(radians(:lat)) * 
            sin(radians(latitude))
        )) * 1000
    """
    
    query = text(f"""
        SELECT 
            id, nom, type, adresse, latitude, longitude, etat, phone, website, 
            description, opening_hours,
            {haversine} AS distance_meters
        FROM etablissement
        WHERE latitude IS NOT NULL 
          AND longitude IS NOT NULL
          AND {haversine} <= :radius
    """)
    
    # Ajout du filtre type si présent
    if type and type.strip():
        query = text(str(query) + " AND type = :type_filter")
        params = {
            "lat": lat, "lng": lng, "radius": radius,
            "type_filter": type.strip().lower()
        }
    else:
        params = {"lat": lat, "lng": lng, "radius": radius}
    
    result = db.execute(query, params)
    rows = result.fetchall()
    
    # Formatage de la réponse
    output = []
    for row in rows:
        type_val = row.type.value if hasattr(row.type, 'value') else row.type
        etat_val = row.etat.value if hasattr(row.etat, 'value') else row.etat
        output.append({
            "id": row.id,
            "nom": row.nom,
            "type": type_val,
            "adresse": row.adresse,
            "latitude": float(row.latitude) if row.latitude else 0.0,
            "longitude": float(row.longitude) if row.longitude else 0.0,
            "etat": etat_val,
            "phone": row.phone,
            "rating": 0,
            "reviews": 0,
            "distance": round(row.distance_meters, 1) if row.distance_meters else None
        })
    
    # Tri par distance croissante
    output.sort(key=lambda x: x["distance"] if x["distance"] else float('inf'))
    
    return output

@router.get("/etablissements/{etab_id}")
def get_detail(etab_id: int, db: Session = Depends(get_db)):
    etab = db.query(Establishment).filter(Establishment.id == etab_id).first()
    if not etab: raise HTTPException(status_code=404, detail="Etablissement introuvable")
    stats = db.query(func.avg(Review.rating), func.count(Review.id)).filter(Review.etablissement_id == etab_id).first()
    avg_rating = round(float(stats[0]), 1) if stats[0] else 0.0
    reviews_count = stats[1] or 0
    recent = db.query(Review).join(Review.user, isouter=True).filter(Review.etablissement_id == etab_id).order_by(Review.created_at.desc()).limit(5).all()
    reviews_list = []
    for r in recent:
        user_name = "Anonyme"
        if r.user and r.user.nom:
            parts = r.user.nom.strip().split()
            user_name = parts[0] if parts else "Anonyme"
        reviews_list.append({
            "id": r.id, "user": user_name, "rating": r.rating,
            "comment": r.comment or "", "date": r.created_at.strftime("%d/%m/%Y") if r.created_at else ""
        })
    return {
        "id": etab.id, "nom": etab.nom,
        "type": etab.type.value if hasattr(etab.type, 'value') else etab.type,
        "adresse": etab.adresse, "phone": etab.phone, "website": etab.website,
        "hours": etab.opening_hours, "description": etab.description,
        "latitude": float(etab.latitude) if etab.latitude else 0.0,
        "longitude": float(etab.longitude) if etab.longitude else 0.0,
        "etat": etab.etat.value if hasattr(etab.etat, 'value') else etab.etat,
        "rating": avg_rating, "reviews_count": reviews_count, "recent_reviews": reviews_list
    }

@router.post("/reviews")
def post_review(data: dict = Body(...), db: Session = Depends(get_db)):
    if "etab_id" not in data or "rating" not in data:
        raise HTTPException(status_code=400, detail="Champs requis manquants : etab_id, rating")
    etab = db.query(Establishment).filter(Establishment.id == data["etab_id"]).first()
    if not etab: raise HTTPException(status_code=404, detail="Etablissement introuvable")
    try:
        rating_val = float(data["rating"])
        if not (0 <= rating_val <= 5): raise HTTPException(status_code=400, detail="La note doit être entre 0 et 5")
    except ValueError:
        raise HTTPException(status_code=400, detail="Note invalide (doit être un nombre)")
    user = db.query(User).filter(User.id == 1).first()
    if not user: raise HTTPException(status_code=404, detail="Utilisateur de test (id=1) manquant dans la base")
    new_review = Review(user_id=1, etablissement_id=int(data["etab_id"]), rating=rating_val, comment=str(data.get("comment", "")).strip(), created_at=datetime.utcnow())
    db.add(new_review); db.commit(); db.refresh(new_review)
    return {"message": "Avis enregistré", "id": new_review.id}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total": db.query(func.count(Establishment.id)).scalar() or 0,
        "hopitaux": db.query(func.count(Establishment.id)).filter(Establishment.type == "hopital").scalar() or 0,
        "pharmacies": db.query(func.count(Establishment.id)).filter(Establishment.type == "pharmacie").scalar() or 0,
        "cliniques": db.query(func.count(Establishment.id)).filter(Establishment.type == "clinique").scalar() or 0,
        "verified_reviews": db.query(func.count(Review.id)).scalar() or 0
    }