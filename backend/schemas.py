from pydantic import BaseModel
from datetime import date
from typing import Optional

class ReactivoBase(BaseModel):
    nombre: str
    cantidad: float
    unidad: str
    fecha_caducidad: Optional[date] = None
    stock_minimo: float = 0

class ReactivoCrear(ReactivoBase):
    pass

class ReactivoRespuesta(ReactivoBase):
    id: int

    class Config:
        from_attributes = True