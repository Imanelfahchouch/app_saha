import requests
import json

def download_health_data():
    url_package = "https://data.gov.ma/data/api/3/action/package_show?id=la-liste-des-hopitaux"
    
    print("🔄 Connexion à data.gov.ma...")
    
    try:
        response = requests.get(url_package)
        data = response.json()
        
        if not data.get('success'):
            print("❌ Erreur: Le package n'a pas été trouvé.")
            return

        resources = data['result']['resources']
        if not resources:
            print("❌ Aucune ressource trouvée.")
            return

        download_url = None
        for res in resources:
            if res.get('format', '').lower() in ['csv', 'json', 'xls']:
                download_url = res['url']
                break
        
        if not download_url and resources:
            download_url = resources[0]['url']

        if not download_url:
            print("❌ Aucun lien de téléchargement valide trouvé.")
            return

        print(f"🔗 Données trouvées ! Téléchargement...")
        file_response = requests.get(download_url)
        
        filename = "data_hopitaux.csv"
        with open(filename, 'wb') as f:
            f.write(file_response.content)
            
        print(f"✅ Succès ! Données sauvegardées dans '{filename}'.")

    except Exception as e:
        print(f"❌ Erreur : {e}")

if __name__ == "__main__":
    download_health_data()