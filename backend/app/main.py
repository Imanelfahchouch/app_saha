from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Imports des routers
from app.routers import etablissements
from app.routers import auth

# ✅ 1. Créer l'app
app = FastAPI(title="SAHA API", version="1.0")

# ✅ 2. AJOUTER CORS IMMÉDIATEMENT (avant toute route)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],              # ← Autorise TOUTES les origines (dev uniquement)
    allow_credentials=True,           # ← Autorise les cookies/auth
    allow_methods=["*"],              # ← GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],              # ← Tous les headers
)

# ✅ 3. Inclure les routes (APRÈS le middleware CORS)
app.include_router(etablissements.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")

# Routes de test
@app.get("/")
def root():
    return {"message": "✅ SAHA API running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}