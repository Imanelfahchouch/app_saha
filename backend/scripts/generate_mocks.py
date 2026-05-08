import random
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import Establishment, EstablishmentType, EstablishmentStatus

def generate_moroccan_mocks():
    """Génère des pharmacies et cliniques réalistes avec coordonnées marocaines."""
    
    # Villes marocaines avec coordonnées approximatives
    cities = [
        ("Casablanca", 33.5731, -7.5898),
        ("Rabat", 34.0209, -6.8416),
        ("Marrakech", 31.6295, -7.9811),
        ("Fès", 34.0181, -5.0078),
        ("Tanger", 35.7595, -5.8340),
        ("Agadir", 30.4278, -9.5981),
        ("Meknès", 33.8935, -5.5473),
        ("Oujda", 34.6867, -1.9114),
        ("Kenitra", 34.2610, -6.5802),
        ("Tétouan", 35.5889, -5.3626),
    ]
    
    # Noms réalistes
    pharmacy_names = [
        "Al Amal", "Ibn Sina", "Al Andalous", "Essalam", "Al Wahda",
        "Al Farabi", "Al Massira", "Al Mouahidine", "Al Qods", "Al Badr",
        "Al Hikma", "Al Nour", "Al Yasmine", "Al Firdaous", "Al Baraka"
    ]
    
    clinic_names = [
        "Al Amal", "Ibn Rochd", "Al Andalous", "Essalam", "Al Farabi",
        "Al Massira", "Al Mouahidine", "Al Qods", "Al Badr", "Al Hikma",
        "Al Nour", "Al Yasmine", "Al Firdaous", "Al Baraka", "Al Wifaq"
    ]
    
    session = SessionLocal()
    added = 0
    
    # Générer 30 pharmacies
    for i in range(30):
        city, lat_base, lng_base = random.choice(cities)
        name = f"Pharmacie {random.choice(pharmacy_names)}"
        # Variation aléatoire de ±0.05° pour disperser dans la ville
        lat = round(lat_base + random.uniform(-0.05, 0.05), 6)
        lng = round(lng_base + random.uniform(-0.05, 0.05), 6)
        address = f"{random.randint(1,200)} Av {random.choice(['Mohammed V', 'Hassan II', 'Al Massira'])}, {city}"
        
        if not session.query(Establishment).filter_by(nom=name, type=EstablishmentType.pharmacie).first():
            session.add(Establishment(
                nom=name,
                type=EstablishmentType.pharmacie,
                adresse=address,
                latitude=lat,
                longitude=lng,
                etat=EstablishmentStatus.ouvert
            ))
            added += 1
    
    # Générer 20 cliniques
    for i in range(20):
        city, lat_base, lng_base = random.choice(cities)
        name = f"Clinique {random.choice(clinic_names)}"
        lat = round(lat_base + random.uniform(-0.05, 0.05), 6)
        lng = round(lng_base + random.uniform(-0.05, 0.05), 6)
        address = f"{random.randint(1,200)} Bd {random.choice(['Ghandi', 'Zerktouni', 'Moulay Youssef'])}, {city}"
        
        if not session.query(Establishment).filter_by(nom=name, type=EstablishmentType.clinique).first():
            session.add(Establishment(
                nom=name,
                type=EstablishmentType.clinique,
                adresse=address,
                latitude=lat,
                longitude=lng,
                etat=EstablishmentStatus.ouvert
            ))
            added += 1
    
    session.commit()
    session.close()
    print(f"✅ {added} établissements simulés ajoutés (pharmacies + cliniques).")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    generate_moroccan_mocks()