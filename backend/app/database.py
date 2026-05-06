from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import DATABASE_URL

# Création du moteur de connexion
engine = create_engine(DATABASE_URL)

# Session pour interagir avec la DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour nos modèles (tables)
Base = declarative_base()

# Fonction utilitaire pour avoir une session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()