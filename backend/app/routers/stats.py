from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Establishment, Review

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    # Compte tout depuis la table 'establishments'
    total = db.query(func.count(Establishment.id)).scalar() or 0
    hopitaux = db.query(func.count(Establishment.id)).filter(Establishment.type == "hopital").scalar() or 0
    pharmacies = db.query(func.count(Establishment.id)).filter(Establishment.type == "pharmacie").scalar() or 0
    cliniques = db.query(func.count(Establishment.id)).filter(Establishment.type == "clinique").scalar() or 0
    
    # Compte les avis depuis la table 'reviews'
    total_avis = db.query(func.count(Review.id)).scalar() or 0

    return {
        "total": total,
        "hopitaux": hopitaux,
        "pharmacies": pharmacies,
        "cliniques": cliniques,
        "avis_verifies": total_avis
    }