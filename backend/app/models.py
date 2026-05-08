import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# --- ENUMS (héritent de enum.Enum, PAS de SQLEnum) ---
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

# --- TABLES ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.user)
    date_creation = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")


class Establishment(Base):
    __tablename__ = "etablissement"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    type = Column(SQLEnum(EstablishmentType), nullable=False)
    adresse = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    etat = Column(SQLEnum(EstablishmentStatus), default=EstablishmentStatus.ouvert)
    
    # Détails supplémentaires
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    opening_hours = Column(String, nullable=True)

    reviews = relationship("Review", back_populates="etablissement")
    favorites = relationship("Favorite", back_populates="etablissement")


class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    etablissement_id = Column(Integer, ForeignKey("etablissement.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reviews")
    etablissement = relationship("Establishment", back_populates="reviews")


class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    etablissement_id = Column(Integer, ForeignKey("etablissement.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    etablissement = relationship("Establishment", back_populates="favorites")