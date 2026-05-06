import os
import sys
import io
import csv
import openpyxl

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import Establishment, EstablishmentType, EstablishmentStatus

def seed_database():
    print("🔄 Connexion à PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables prêtes.")

    file_path = "data_hopitaux.csv"
    if not os.path.exists(file_path):
        print("❌ Fichier introuvable.")
        return

    with open(file_path, 'rb') as f:
        raw_bytes = f.read()

    is_excel = raw_bytes.startswith(b'PK\x03\x04')
    
    session = SessionLocal()
    count = 0

    try:
        if is_excel:
            print("📦 Format détecté : Fichier Excel (contournement de l'extension .csv)")
            wb = openpyxl.load_workbook(io.BytesIO(raw_bytes), data_only=True)
            ws = wb.active

            header_row = None
            start_idx = 1
            for r_idx, row in enumerate(ws.iter_rows(min_row=1, max_row=15, values_only=True), start=1):
                if row and any("Etablissement" in str(cell) for cell in row if cell):
                    header_row = [str(cell).strip().lower() for cell in row if cell]
                    start_idx = r_idx + 1
                    print(f"📋 En-têtes trouvés ligne {r_idx} : {header_row}")
                    break

            if not header_row:
                raise ValueError("Impossible de trouver la ligne d'en-têtes dans le fichier.")

            col_map = {}
            for i, h in enumerate(header_row):
                if "etablissement" in h:
                    col_map['nom'] = i
                elif "région" in h or "region" in h:
                    col_map['region'] = i
                elif "delegation" in h:
                    col_map['delegation'] = i
                elif "commune" in h:
                    col_map['commune'] = i

            print(f"🗺️ Colonnes mappées : {col_map}")

            for row in ws.iter_rows(min_row=start_idx, values_only=True):
                if not row or len(row) <= col_map.get('nom', 0):
                    continue
                
                nom = row[col_map.get('nom', 0)]
                if not nom or str(nom).strip() == "":
                    continue

                region = row[col_map.get('region', 0)] if 'region' in col_map else ""
                delegation = row[col_map.get('delegation', 0)] if 'delegation' in col_map else ""
                commune = row[col_map.get('commune', 0)] if 'commune' in col_map else ""

                session.add(Establishment(
                    nom=str(nom).strip(),
                    type=EstablishmentType.hopital,
                    adresse=f"{commune}, {delegation}, {region}".strip(),
                    latitude=31.7917,
                    longitude=-7.0926,
                    etat=EstablishmentStatus.ouvert
                ))
                count += 1
                if count % 50 == 0:
                    session.commit()
                    print(f"   ... {count} établissements insérés")

        else:
            print("📄 Format détecté : CSV classique")
            decoded = None
            for enc in ['utf-8-sig', 'cp1252', 'latin-1']:
                try:
                    decoded = raw_bytes.decode(enc)
                    break
                except Exception:
                    continue
            
            if not decoded:
                raise ValueError("Impossible de décoder le fichier CSV.")

            reader = csv.DictReader(io.StringIO(decoded))
            if reader.fieldnames:
                reader.fieldnames = [f.strip().lower() for f in reader.fieldnames]

            for row in reader:
                nom = row.get('etablissement hospitalier') or row.get('etablissement')
                if not nom or nom.strip() == "":
                    continue

                session.add(Establishment(
                    nom=nom.strip(),
                    type=EstablishmentType.hopital,
                    adresse=f"{row.get('commune','')}, {row.get('delegation','')}, {row.get('région','')}",
                    latitude=31.7917,
                    longitude=-7.0926,
                    etat=EstablishmentStatus.ouvert
                ))
                count += 1
                if count % 50 == 0:
                    session.commit()
                    print(f"   ... {count} établissements insérés")

        session.commit()
        print(f"\n🎉 SUCCÈS ! {count} établissements ajoutés à PostgreSQL.")

    except Exception as e:
        print(f"❌ Échec critique : {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    seed_database()