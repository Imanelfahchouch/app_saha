import os
import sys
import csv
import openpyxl
import io

# ✅ Force Python à trouver le dossier 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.insert(0, backend_dir)

from app.database import SessionLocal, engine, Base
from app.models import Establishment, EstablishmentType, EstablishmentStatus

def seed_hopitaux():
    print("🔄 [1/3] Connexion à PostgreSQL et création des tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables vérifiées/créées.")
    except Exception as e:
        print(f"❌ Erreur connexion/tables : {e}")
        sys.exit(1)

    session = SessionLocal()
    csv_path = os.path.join(current_dir, "data_hopitaux.csv")
    
    if not os.path.exists(csv_path):
        print(f"❌ Fichier introuvable : {csv_path}")
        print("💡 Vérifie qu'il s'appelle exactement 'data_hopitaux.csv' et qu'il est dans le dossier 'scripts/'.")
        session.close()
        sys.exit(1)

    print(f"📂 [2/3] Lecture de : {os.path.basename(csv_path)}")
    inserted = 0
    
    try:
        with open(csv_path, 'rb') as f:
            raw = f.read()
        
        is_excel = raw.startswith(b'PK\x03\x04')
        
        if is_excel:
            wb = openpyxl.load_workbook(io.BytesIO(raw), data_only=True)
            ws = wb.active
            start_row = 2  # Suppose ligne 1 = en-têtes
            for row in ws.iter_rows(min_row=start_row, values_only=True):
                if not row or not row[3]: continue  # Colonne D = Nom
                nom = str(row[3]).strip()
                region = str(row[0]) if row[0] else ""
                delegation = str(row[1]) if row[1] else ""
                commune = str(row[2]) if row[2] else ""
                
                session.add(Establishment(
                    nom=nom,
                    type=EstablishmentType.hopital,
                    adresse=f"{commune}, {delegation}, {region}".strip(),
                    latitude=31.7917,
                    longitude=-7.0926,
                    etat=EstablishmentStatus.ouvert
                ))
                inserted += 1
        else:
            # Fallback CSV
            with open(csv_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    nom = row.get('Etablissement hospitalier') or row.get('etablissement') or row.get('nom')
                    if not nom: continue
                    session.add(Establishment(
                        nom=nom.strip(),
                        type=EstablishmentType.hopital,
                        adresse=f"{row.get('commune','')}, {row.get('delegation','')}, {row.get('région','')}",
                        latitude=31.7917,
                        longitude=-7.0926,
                        etat=EstablishmentStatus.ouvert
                    ))
                    inserted += 1

        print(f"📤 [3/3] Envoi de {inserted} lignes vers PostgreSQL...")
        session.commit()
        print(f"🎉 SUCCÈS ! {inserted} hôpitaux ajoutés définitivement dans la table 'establishments'.")
        
    except Exception as e:
        session.rollback()
        print(f"❌ ÉCHEC : {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_hopitaux()