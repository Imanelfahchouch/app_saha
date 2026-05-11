import os
from dotenv import load_dotenv

load_dotenv()

# Configuration de la base de données
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Imane2005@localhost:5432/saha")

# Sécurité JWT
SECRET_KEY = os.getenv("SECRET_KEY", "ma_super_cle_secrete_pour_le_pfe")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60