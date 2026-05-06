from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# ⬇️ Ajoute cet import
from app.routers import etablissements

app = FastAPI(title="SAHA API")

# Configuration CORS (pour autoriser React à parler au backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En prod, mets ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⬇️ Inclus le routeur
app.include_router(etablissements.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "API SAHA est en ligne 🚀"}