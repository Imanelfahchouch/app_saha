from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Establishment, Review, User
from typing import Optional, List
from datetime import datetime
import math
import re

router = APIRouter()

def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcule la distance en MÈTRES entre deux coordonnées GPS"""
    R = 6371000  # Rayon Terre en mètres
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def get_dynamic_status(hours_str: Optional[str]) -> str:
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


# ✅ ROUTE /nearby SÉPARÉE (pour compatibilité avec ton frontend)
@router.get("/etablissements/nearby")
def get_nearby(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: float = Query(5000, ge=100, le=50000),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Establishment)
    if type:
        query = query.filter(Establishment.type == type)
    
    results = query.all()
    output = []
    
    for etab in results:
        # Ignore si pas de coordonnées
        if not etab.latitude or not etab.longitude:
            continue
            
        # Calcule distance en mètres
        distance = haversine_meters(lat, lng, float(etab.latitude), float(etab.longitude))
        
        # Filtre par rayon
        if distance > radius:
            continue
        
        # Stats avis
        avg = db.query(func.avg(Review.rating)).filter(Review.etablissement_id == etab.id).scalar() or 0
        count = db.query(func.count(Review.id)).filter(Review.etablissement_id == etab.id).scalar() or 0
        type_val = etab.type.value if hasattr(etab.type, 'value') else etab.type
        
        output.append({
            "id": etab.id,
            "nom": etab.nom,
            "type": type_val,
            "adresse": etab.adresse,
            "latitude": float(etab.latitude),
            "longitude": float(etab.longitude),
            "etat": get_dynamic_status(etab.opening_hours),
            "phone": etab.phone,
            "rating": round(float(avg), 1),
            "reviews": count,
            "distance": round(distance, 2)  # Distance en mètres
        })
    
    # Trie du plus proche au plus loin
    output.sort(key=lambda x: x["distance"])
    return output
@router.get("/etablissements", response_model=List[dict])
def get_all(
    db: Session = Depends(get_db),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(None)  # Rayon en MÈTRES
):
    query = db.query(Establishment)
    if type:
        query = query.filter(Establishment.type == type)
    if search:
        query = query.filter(
            Establishment.nom.ilike(f"%{search}%") |
            Establishment.adresse.ilike(f"%{search}%")
        )
    
    results = query.all()
    output = []
    
    for etab in results:
        # Calcul note et avis
        avg = db.query(func.avg(Review.rating)).filter(Review.etablissement_id == etab.id).scalar() or 0
        count = db.query(func.count(Review.id)).filter(Review.etablissement_id == etab.id).scalar() or 0
        
        # ✅ Calcul distance si coordonnées fournies
        distance = None
        if lat is not None and lng is not None and etab.latitude and etab.longitude:
            distance = round(haversine_meters(lat, lng, float(etab.latitude), float(etab.longitude)), 2)
            
            # ✅ FILTRE STRICT : ignore tout ce qui est hors du rayon
            if radius is not None and distance > radius:
                continue
        
        type_val = etab.type.value if hasattr(etab.type, 'value') else etab.type
        etat_val = get_dynamic_status(etab.opening_hours)
        
        output.append({
            "id": etab.id,
            "nom": etab.nom,
            "type": type_val,
            "adresse": etab.adresse,
            "latitude": float(etab.latitude) if etab.latitude else 0.0,
            "longitude": float(etab.longitude) if etab.longitude else 0.0,
            "etat": etat_val,
            "phone": etab.phone,
            "hours": etab.opening_hours,
            "rating": round(float(avg), 1) if avg else 0.0,
            "reviews": count,
            "distance": distance  # ✅ Retourne la distance en mètres
        })
    
    # ✅ TRI : du plus proche au plus loin (seulement si coordonnées fournies)
    if lat is not None and lng is not None:
        output.sort(key=lambda x: x["distance"] if x["distance"] is not None else 999999)
        
    return output

@router.get("/etablissements/{etab_id}")
def get_detail(etab_id: int, db: Session = Depends(get_db)):
    etab = db.query(Establishment).filter(Establishment.id == etab_id).first()
    if not etab:
        raise HTTPException(status_code=404, detail="Établissement introuvable")
    
    stats = db.query(func.avg(Review.rating), func.count(Review.id)).filter(
        Review.etablissement_id == etab_id
    ).first()
    avg_rating = round(float(stats[0]), 1) if stats[0] else 0.0
    reviews_count = stats[1] or 0
    
    recent = db.query(Review).join(Review.user, isouter=True).filter(
        Review.etablissement_id == etab_id
    ).order_by(Review.created_at.desc()).limit(5).all()
    
    reviews_list = []
    for r in recent:
        user_name = "Anonyme"
        if r.user and r.user.nom:
            parts = r.user.nom.strip().split()
            user_name = parts[0] if parts else "Anonyme"
        reviews_list.append({
            "id": r.id,
            "user": user_name,
            "rating": r.rating,
            "comment": r.comment or "",
            "date": r.created_at.strftime("%d/%m/%Y") if r.created_at else ""
        })
        
    type_val = etab.type.value if hasattr(etab.type, 'value') else etab.type
    etat_val = get_dynamic_status(etab.opening_hours)
    
    return {
        "id": etab.id,
        "nom": etab.nom,
        "type": type_val,
        "adresse": etab.adresse,
        "phone": etab.phone,
        "website": etab.website,
        "hours": etab.opening_hours,
        "description": etab.description,
        "latitude": float(etab.latitude) if etab.latitude else 0.0,
        "longitude": float(etab.longitude) if etab.longitude else 0.0,
        "etat": etat_val,
        "rating": avg_rating,
        "reviews_count": reviews_count,
        "recent_reviews": reviews_list
    }

@router.post("/reviews")
def post_review( dict = Body(...), db: Session = Depends(get_db)):
    if "etab_id" not in data or "rating" not in data:
        raise HTTPException(status_code=400, detail="Champs requis manquants : etab_id, rating")
    
    etab = db.query(Establishment).filter(Establishment.id == data["etab_id"]).first()
    if not etab:
        raise HTTPException(status_code=404, detail="Établissement introuvable")
        
    try:
        rating_val = float(data["rating"])
        if not (0 <= rating_val <= 5):
            raise HTTPException(status_code=400, detail="La note doit être entre 0 et 5")
    except ValueError:
        raise HTTPException(status_code=400, detail="Note invalide")
        
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur de test manquant")
        
    new_review = Review(
        user_id=1,
        etablissement_id=int(data["etab_id"]),
        rating=rating_val,
        comment=str(data.get("comment", "")).strip(),
        created_at=datetime.utcnow()
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
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