from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import schemas

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"mensaje": "El inventario de laboratorio está funcionando"}

@app.post("/reactivos", response_model=schemas.ReactivoRespuesta)
def crear_reactivo(reactivo: schemas.ReactivoCrear, db: Session = Depends(get_db)):
    nuevo_reactivo = models.Reactivo(**reactivo.model_dump())
    db.add(nuevo_reactivo)
    db.commit()
    db.refresh(nuevo_reactivo)
    return nuevo_reactivo

@app.get("/reactivos", response_model=list[schemas.ReactivoRespuesta])
def listar_reactivos(db: Session = Depends(get_db)):
    return db.query(models.Reactivo).all()

@app.get("/reactivos/{reactivo_id}", response_model=schemas.ReactivoRespuesta)
def obtener_reactivo(reactivo_id: int, db: Session = Depends(get_db)):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    return reactivo

@app.put("/reactivos/{reactivo_id}", response_model=schemas.ReactivoRespuesta)
def actualizar_reactivo(reactivo_id: int, datos: schemas.ReactivoCrear, db: Session = Depends(get_db)):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")

    for campo, valor in datos.model_dump().items():
        setattr(reactivo, campo, valor)

    db.commit()
    db.refresh(reactivo)
    return reactivo

@app.delete("/reactivos/{reactivo_id}")
def borrar_reactivo(reactivo_id: int, db: Session = Depends(get_db)):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")

    db.delete(reactivo)
    db.commit()
    return {"mensaje": f"Reactivo {reactivo_id} eliminado correctamente"}

from datetime import date, timedelta

@app.get("/alertas")
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