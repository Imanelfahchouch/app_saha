import sys, os, time, requests, re
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SessionLocal
from app.models import Establishment

# 🚫 Mots à ignorer lors de l'extraction (pour ne pas prendre "Hôpital" ou "Avenue" comme ville)
IGNORE_KEYWORDS = [
    "hôpital", "clinique", "centre", "pharmacie", "cabinet", "laboratoire", 
    "maison", "résidence", "lotissement", "quartier", "avenue", "rue", 
    "boulevard", "place", "route", "km", "n°", "bp", "code", "postal", 
    "municipalité", "commune", "province", "préfecture"
]

def extract_city_smart(adresse):
    """Extrait la ville dynamiquement depuis une adresse marocaine typique"""
    if not adresse:
        return None
    
    text = adresse.lower().strip()
    # Sépare par virgules, parenthèses, tirets
    parts = re.split(r'[,()\-\n]', text)
    
    # Filtre les morceaux pertinents
    candidates = [p.strip() for p in parts if p.strip() and not any(kw in p for kw in IGNORE_KEYWORDS)]
    
    # Dans 90% des adresses marocaines, la ville est le 1er ou 2ème élément pertinent
    for candidate in candidates:
        candidate = candidate.strip()
        # Ignorer les nombres purs ou chaînes trop courtes
        if len(candidate) > 2 and not candidate.isdigit():
            return candidate
            
    return None

def fix_coordinates():
    print("🌍 Démarrage géocodage intelligent (couvre TOUTES les villes du Maroc)...")
    session = SessionLocal()
    etabs = session.query(Establishment).all()
    corrected = 0
    skipped = 0

    for i, etab in enumerate(etabs, 1):
        city = extract_city_smart(etab.adresse)
        if not city:
            skipped += 1
            continue

        # Requête Nominatim : uniquement le nom de ville + Maroc
        query = f"{city}, Maroc"
        url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
        headers = {'User-Agent': 'SahaPFE/1.0 (etudiant.pfe)'}

        try:
            time.sleep(1.0)  # ⏳ Respect strict de la limite Nominatim (1 req/sec)
            resp = requests.get(url, headers=headers, timeout=5)
            data = resp.json()

            if data and len(data) > 0:
                lat, lon = float(data[0]['lat']), float(data[0]['lon'])
                # 🇦 Vérification des limites géographiques du Maroc
                if 27 <= lat <= 36 and -13 <= lon <= -1:
                    etab.latitude = lat
                    etab.longitude = lon
                    corrected += 1
                    print(f"✅ [{i}/{len(etabs)}] {etab.nom[:20]:<20} → {lat:.4f}, {lon:.4f} (ville détectée: {city})")
                else:
                    print(f"️  [{i}/{len(etabs)}] {etab.nom[:20]} → Coords hors Maroc ignorées")
            else:
                print(f"❌ [{i}/{len(etabs)}] {etab.nom[:20]} → Ville non trouvée ({query})")
        except Exception as e:
            print(f"💥 [{i}/{len(etabs)}] Erreur réseau/API: {e}")

    session.commit()
    session.close()
    print(f"\n🏁 Terminé ! {corrected} établissements corrigés, {skipped} ignorés (adresses incomplètes).")
    print("💡 Relance ton API : le bouton 'Près de moi' fonctionnera partout au Maroc.")

if __name__ == "__main__":
    fix_coordinates()