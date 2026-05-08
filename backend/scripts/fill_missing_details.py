import sys, os, random
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SessionLocal
from app.models import Establishment, EstablishmentType

def fill_missing_details():
    session = SessionLocal()
    
    # 🔍 Cible uniquement les établissements où phone OU hours est vide
    missing = session.query(Establishment).filter(
        (Establishment.phone == None) | (Establishment.opening_hours == None)
    ).all()
    
    print(f"🔄 Complétion de {len(missing)} établissements...")
    
    for etab in missing:
        # 📞 Génère un téléphone réaliste si manquant
        if not etab.phone:
            if etab.type == EstablishmentType.hopital:
                prefix = "5 22"
            elif etab.type == EstablishmentType.pharmacie:
                prefix = "5 35"
            else: # clinique
                prefix = "5 37"
            etab.phone = f"+212 {prefix} {random.randint(10,99)} {random.randint(10,99)} {random.randint(10,99)}"
            
        #  Génère des horaires standards si manquants
        if not etab.opening_hours:
            if etab.type == EstablishmentType.hopital:
                etab.opening_hours = "Urgences : 24h/24 | Consultations : 08h00-16h00"
            elif etab.type == EstablishmentType.pharmacie:
                etab.opening_hours = "Lun-Sam : 08h30-20h00 | Dim : 09h00-13h00"
            else:
                etab.opening_hours = "Lun-Ven : 08h00-18h00 | Sam : 09h00-13h00"
                
    session.commit()
    session.close()
    print("✅ Terminé. Tous les établissements ont maintenant un téléphone et des horaires.")

if __name__ == "__main__":
    fill_missing_details()