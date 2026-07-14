from pydantic import BaseModel
from datetime import date
from typing import Optional
from enum import Enum

class Rol(str, Enum):
    viewer = "viewer"
    admin = "admin"
    superadmin = "superadmin"

class ReactivoBase(BaseModel):
    nombre: str
    cantidad: float
    unidad: str
    fecha_caducidad: Optional[date] = None
    stock_minimo: float = 0
    fds_pdf: Optional[str] = None

class ReactivoCrear(ReactivoBase):
    pass

class ReactivoActualizar(BaseModel):
    nombre: str
    cantidad: float
    unidad: str
    fecha_caducidad: Optional[date] = None
    stock_minimo: float = 0

class ReactivoRespuesta(ReactivoBase):
    id: int

    class Config:
        from_attributes = True

class UsuarioCrear(BaseModel):
    email: str
    nombre: str
    apellido: str
    password: str
    rol: Rol = Rol.viewer

class UsuarioRespuesta(BaseModel):
    id: int
    email: str
    nombre: str
    apellido: str
    rol: Rol
    class Config:
        from_attributes = True
    
class UsuarioActualizar(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    rol: Optional[Rol] = None

