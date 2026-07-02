from pydantic import BaseModel
from datetime import date
from typing import Optional

class ReactivoBase(BaseModel):
    nombre: str
    cantidad: float
    unidad: str
    fecha_caducidad: Optional[date] = None
    stock_minimo: float = 0
    fds_pdf: Optional[str] = None

class ReactivoCrear(ReactivoBase):
    pass

class ReactivoRespuesta(ReactivoBase):
    id: int

    class Config:
        from_attributes = True

class UsuarioCrear(BaseModel):
    email: str
    nombre: str
    apellido: str
    password: str
    rol: str = "viewer"

class UsuarioRespuesta(BaseModel):
    id: int
    email: str
    nombre: str
    apellido: str
    rol: str

    class Config:
        from_attributes = True