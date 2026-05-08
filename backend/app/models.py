from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, DateTime, Text, DECIMAL
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import datetime

# --- TYPES ENUM ---
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class EstablishmentType(str, enum.Enum):
    pharmacie = "pharmacie"
    clinique = "clinique"
    hopital = "hopital"

class EstablishmentStatus(str, enum.Enum):
    ouvert = "ouvert"
    ferme = "ferme"

class ReviewStatus(str, enum.Enum):
    en_attente = "en_attente"
    valide = "valide"
    refuse = "refuse"

# --- TABLES ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    date_creation = Column(DateTime, default=datetime.utcnow)

    # Relations
    reviews = relationship("Review", back_populates="user")

class Establishment(Base):
    __tablename__ = "etablissement"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(150), nullable=False)
    type = Column(Enum(EstablishmentType), nullable=False)
    adresse = Column(Text, nullable=False)
    latitude = Column(DECIMAL(10, 8), nullable=False)
    longitude = Column(DECIMAL(11, 8), nullable=False)
    etat = Column(Enum(EstablishmentStatus), default=EstablishmentStatus.ouvert)
    
    # Relations
    reviews = relationship("Review", back_populates="etablissement")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    etablissement_id = Column(Integer, ForeignKey("etablissement.id"))
    rating = Column(Integer, nullable=False) # Note sur 5
    commentaire = Column(Text)
    statut = Column(Enum(ReviewStatus), default=ReviewStatus.valide)
    date_creation = Column(DateTime, default=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="reviews")
    etablissement = relationship("Establishment", back_populates="reviews")