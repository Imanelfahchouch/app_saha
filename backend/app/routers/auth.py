from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

router = APIRouter()

# ✅ Configuration bcrypt + JWT
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # ✅ Tronque à 72 caractères max pour bcrypt
    return pwd_context.hash(password[:72])

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Vérifie si l'email existe déjà
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    # ✅ Hash du mot de passe (tronqué à 72 chars max)
    hashed = get_password_hash(user.mot_de_passe[:72])
    
    # Crée l'utilisateur
    new_user = User(
        nom=user.nom,
        email=user.email,
        hashed_password=hashed,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse(
        id=new_user.id,
        nom=new_user.nom,
        email=new_user.email,
        role=new_user.role
    )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # ✅ OAuth2PasswordRequestForm envoie 'username' pour l'email et 'password' pour le mot de passe
    email = form_data.username  # ← C'est l'email
    password = form_data.password
    
    # Trouve l'utilisateur
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Génère le token JWT
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nom": user.nom,
            "email": user.email,
            "role": user.role
        }
    }