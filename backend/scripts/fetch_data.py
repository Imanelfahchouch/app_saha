import requests

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def download_by_search(keyword, output_filename):
    print(f"\n🔍 Recherche sur data.gov.ma : '{keyword}'...")
    url = f"https://data.gov.ma/data/api/3/action/package_search?q={keyword}&rows=1"
    try:
        res = requests.get(url, headers=HEADERS)
        data = res.json()
        
        if not data.get('success') or data['result']['count'] == 0:
            print(f"❌ Aucun dataset trouvé. Essaie un autre mot-clé ou télécharge manuellement.")
            return False
            
        pkg = data['result']['results'][0]
        print(f"📦 Dataset trouvé : {pkg['title']}")
        
        if not pkg['resources']:
            print("❌ Aucun fichier téléchargeable dans ce dataset.")
            return False
            
        file_url = pkg['resources'][0]['url']
        print(f"⬇️ Téléchargement depuis : {file_url}")
        
        file_res = requests.get(file_url, headers=HEADERS)
        with open(output_filename, 'wb') as f:
            f.write(file_res.content)
        print(f"✅ Sauvegardé : {output_filename}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur réseau ou API : {e}")
        return False

if __name__ == "__main__":
    # Télécharge automatiquement les fichiers officiels
    download_by_search("pharmacie maroc annuaire", "data_pharmacies.csv")
    download_by_search("clinique privé santé maroc", "data_cliniques.csv")