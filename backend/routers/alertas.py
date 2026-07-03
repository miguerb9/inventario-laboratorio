from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
import models
import schemas
from database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/alertas")
def obtener_alertas(db: Session = Depends(get_db)):
    hoy = date.today()
    limite_caducidad = hoy + timedelta(days=30)
    stock_bajo = db.query(models.Reactivo).filter(
        models.Reactivo.cantidad <= models.Reactivo.stock_minimo
    ).all()
    proximos_a_caducar = db.query(models.Reactivo).filter(
        models.Reactivo.fecha_caducidad <= limite_caducidad,
        models.Reactivo.fecha_caducidad != None
    ).all()
    return {
        "stock_bajo": [schemas.ReactivoRespuesta.model_validate(r) for r in stock_bajo],
        "proximos_a_caducar": [schemas.ReactivoRespuesta.model_validate(r) for r in proximos_a_caducar]
    }