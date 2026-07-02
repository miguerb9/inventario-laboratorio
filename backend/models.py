from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Reactivo(Base):
    __tablename__ = "reactivos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    fecha_caducidad = Column(Date, nullable=True)
    stock_minimo = Column(Float, nullable=False, default=0)
    fds_pdf = Column(String, nullable=True)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    rol = Column(String, nullable=False, default="viewer")