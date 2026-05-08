from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Import du routeur (chemin relatif correct)
from app.routers import etablissements
from app.routers import stats  # ✅ AJOUTE CETTE LIGNE

app = FastAPI(title="SAHA API", version="1.0")

# ✅ CORS : autorise le frontend React à appeler le backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod : ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ENREGISTREMENT DU ROUTEUR (C'EST ICI QUE ÇA SE JOUE)
app.include_router(
    etablissements.router,
    prefix="/api",  # Toutes les routes auront /api en préfixe
    tags=["Établissements"]
)
app.include_router(stats.router, prefix="/api")  

# Route de test
@app.get("/")
def root():
    return {"message": "🚀 SAHA API is running", "docs": "/docs"}

# Route de santé
@app.get("/health")
def health():
    return {"status": "ok"}