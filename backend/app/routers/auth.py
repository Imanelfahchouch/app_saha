from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token, EmailRequest, ResetPasswordRequest
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import smtplib
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter()

# ✅ Configuration bcrypt + JWT
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("❌ SECRET_KEY non définie")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# ✅ Configuration SMTP
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@saha.ma")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://saha.ma")

# 🔍 Debug: afficher la config (masque le mot de passe)
print(f"\n🔧 Config SMTP chargée:")
print(f"   HOST: {SMTP_HOST}")
print(f"   PORT: {SMTP_PORT}")
print(f"   USER: {SMTP_USER}")
print(f"   FROM: {SMTP_FROM}")
print(f"   FRONTEND: {FRONTEND_URL}\n")

if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD]):
    raise RuntimeError("❌ Configuration SMTP incomplète. Vérifie ton fichier .env")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password[:72])

def create_access_token( data:dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_reset_email(user_email: str, reset_token: str):
    """Envoi d'email avec DEBUG complet"""
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    print(f"📧 Tentative d'envoi à: {user_email}")
    print(f"🔗 Lien: {reset_link}")
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "🔐 Réinitialisation de mot de passe - SAHA"
    msg["From"] = SMTP_FROM
    msg["To"] = user_email
    
    text_body = f"""Bonjour,

Vous avez demandé à réinitialiser votre mot de passe sur SAHA.

Lien: {reset_link}

Ce lien expire dans 30 minutes.

Cordialement,
L'équipe SAHA"""
    
    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:20px;text-align:center;border-radius:10px 10px 0 0;">
            <h1 style="color:white;margin:0;">SAHA</h1>
        </div>
        <div style="padding:25px;background:#f8fafc;border:1px solid #e2e8f0;">
            <h2>🔐 Réinitialisation</h2>
            <p>Bonjour,</p>
            <p>Cliquez ci-dessous pour réinitialiser votre mot de passe :</p>
            <div style="text-align:center;margin:20px 0;">
                <a href="{reset_link}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
                    Réinitialiser
                </a>
            </div>
            <p style="font-size:0.9em;color:#64748b;">⚠️ Lien valable 30 minutes</p>
        </div>
    </body></html>"""
    
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    
    try:
        print(f"🔌 Connexion à {SMTP_HOST}:{SMTP_PORT}...")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.set_debuglevel(1)  # ✅ Active les logs SMTP détaillés
            print("🔐 Démarrage TLS...")
            server.starttls()
            print(f"🔑 Login avec {SMTP_USER}...")
            server.login(SMTP_USER, SMTP_PASSWORD)
            print("📤 Envoi du message...")
            server.send_message(msg)
            print(f"✅ Email envoyé avec succès à {user_email} !")
            return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Erreur d'authentification SMTP: {e}")
        print("💡 Vérifie: 1) App Password Gmail 2) 2FA activé 3) Moins d'apps sécurisées")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"❌ Erreur de connexion SMTP: {e}")
        print("💡 Vérifie: 1) Firewall/antivirus 2) Port bloqué 3) HOST correct")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ Erreur SMTP générique: {e}")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    hashed = get_password_hash(user.mot_de_passe[:72])
    new_user = User(nom=user.nom, email=user.email, hashed_password=hashed, role="user")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse(id=new_user.id, nom=new_user.nom, email=new_user.email, role=new_user.role)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username
    password = form_data.password
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe incorrect", headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "nom": user.nom, "email": user.email, "role": user.role}}

@router.post("/forgot-password")
async def forgot_password(request: EmailRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"message": "Si cet email existe, un lien a été envoyé."}
    reset_token = create_access_token(data={"sub": str(user.id), "type": "password_reset", "email": user.email}, expires_delta=timedelta(minutes=30))
    
    # 🧪 MODE DEBUG : Appel synchrone pour voir les erreurs immédiatement
    # En production, remplace par: background_tasks.add_task(send_reset_email, user.email, reset_token)
    success = send_reset_email(user.email, reset_token)
    if not success:
        # Ne pas révéler l'erreur technique au client
        pass
    
    return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        token_email = payload.get("email")
        if token_type != "password_reset":
            raise HTTPException(status_code=400, detail="Token invalide")
        user = db.query(User).filter(User.id == int(user_id), User.email == token_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable")
        user.hashed_password = get_password_hash(request.new_password[:72])
        db.commit()
        return {"message": "Mot de passe réinitialisé avec succès."}
    except JWTError:
        raise HTTPException(status_code=400, detail="Token expiré ou invalide")
    except ValueError:
        raise HTTPException(status_code=400, detail="Données invalides")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db), current_user: User = Depends(lambda: None)):
    raise HTTPException(status_code=401, detail="Non authentifié")