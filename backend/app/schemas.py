from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# ✅ Enums pour les rôles et types (doivent matcher models.py)
class UserRole(str, Enum):
    user = "user"
    admin = "admin"

class EstablishmentType(str, Enum):
    pharmacie = "pharmacie"
    clinique = "clinique"
    hopital = "hopital"

# ✅ Schémas pour l'authentification
class UserCreate(BaseModel):
    """Données reçues lors de l'inscription"""
    nom: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mot_de_passe: str = Field(..., min_length=6, max_length=72)  # ← bcrypt max 72 chars

class UserLogin(BaseModel):
    """Données reçues lors de la connexion (alternative à OAuth2PasswordRequestForm)"""
    email: EmailStr
    mot_de_passe: str

class UserResponse(BaseModel):
    """Données renvoyées après inscription/connexion (sans le mot de passe)"""
    id: int
    nom: str
    email: EmailStr
    role: Optional[str] = "user"
    
    class Config:
        from_attributes = True  # ← Pour convertir les modèles SQLAlchemy en dict

class Token(BaseModel):
    """Réponse de connexion avec JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ✅ Schémas pour les établissements
class EstablishmentBase(BaseModel):
    """Champs communs pour création/mise à jour"""
    nom: str = Field(..., min_length=2, max_length=255)
    type: EstablishmentType
    adresse: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    etat: Optional[str] = "ouvert"
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    opening_hours: Optional[str] = None

class EstablishmentCreate(EstablishmentBase):
    """Données pour créer un établissement"""
    pass

class EstablishmentUpdate(BaseModel):
    """Données pour mettre à jour un établissement (tous champs optionnels)"""
    nom: Optional[str] = None
    type: Optional[EstablishmentType] = None
    adresse: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    etat: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    opening_hours: Optional[str] = None

class EstablishmentResponse(EstablishmentBase):
    """Réponse API pour un établissement"""
    id: int
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# ✅ Schémas pour les avis
class ReviewCreate(BaseModel):
    """Données pour créer un avis"""
    etablissement_id: int
    rating: float = Field(..., ge=0, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    """Réponse API pour un avis"""
    id: int
    user: str  # nom de l'utilisateur
    rating: float
    comment: Optional[str]
    date: Optional[str]
    
    class Config:
        from_attributes = True
        # ... (ton code existant se termine ici) ...

# ✅ Nouveaux schemas pour réinitialisation de mot de passe
class EmailRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str