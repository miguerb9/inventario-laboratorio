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