import sys, os, random
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SessionLocal
from app.models import Establishment, EstablishmentType

def generate_realistic_details():
    session = SessionLocal()
    establishments = session.query(Establishment).all()
    print(f"🔄 Mise à jour de {len(establishments)} établissements...")

    for etab in establishments:
        # Téléphone réaliste marocain
        if not etab.phone:
            prefix = random.choice(["5 22", "5 23", "5 35", "5 37", "5 40", "5 42", "5 44"])
            etab.phone = f"+212 {prefix} {random.randint(10,99)} {random.randint(10,99)} {random.randint(10,99)}"
        
        # Horaires par type
        if not etab.opening_hours:
            if etab.type == EstablishmentType.hopital:
                etab.opening_hours = "Urgences : 24h/24 | Consultations : 08h00-16h00"
            elif etab.type == EstablishmentType.pharmacie:
                etab.opening_hours = "Lun-Sam : 08h30-20h00 | Dim : 09h00-13h00"
            else:
                etab.opening_hours = "Lun-Ven : 08h00-18h00 | Sam : 09h00-13h00"
        
        # Description
        if not etab.description:
            city = etab.adresse.split(',')[-1].strip() if ',' in etab.adresse else "Maroc"
            etab.description = f"{etab.nom} est un établissement de santé situé à {city}. Il offre des services professionnels adaptés aux besoins de la population locale."
        
        # Site web
        if not etab.website:
            clean = etab.nom.lower().replace(" ", "-").replace(".", "").replace("'", "")
            etab.website = f"https://www.{clean}.ma"

    session.commit()
    session.close()
    print("✅ Détails (téléphone, horaires, description) générés avec succès.")

if __name__ == "__main__":
    generate_realistic_details()