from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ IMPORTS DES ROUTERS (CORRIGÉ)
from app.routers import etablissements
from app.routers import auth  # ← Ajouté : import du module auth

app = FastAPI(title="SAHA API", description="Plateforme de géolocalisation santé Maroc")

# CORS : autoriser le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ INCLUSION DES ROUTES (CORRIGÉ)
app.include_router(etablissements.router, prefix="/api")
app.include_router(auth.router, prefix="/api")  # ← Maintenant 'auth' est défini ✅

@app.get("/")
def root():
    return {"message": "✅ SAHA API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}