from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import shutil
import os
import models
import schemas
from database import SessionLocal
from auth import obtener_usuario_actual

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/reactivos", response_model=schemas.ReactivoRespuesta)
def crear_reactivo(reactivo: schemas.ReactivoCrear, db: Session = Depends(get_db)):
    nuevo_reactivo = models.Reactivo(**reactivo.model_dump())
    db.add(nuevo_reactivo)
    db.commit()
    db.refresh(nuevo_reactivo)
    return nuevo_reactivo

@router.get("/reactivos", response_model=list[schemas.ReactivoRespuesta])
def listar_reactivos(db: Session = Depends(get_db)):
    return db.query(models.Reactivo).all()

@router.get("/reactivos/{reactivo_id}", response_model=schemas.ReactivoRespuesta)
def obtener_reactivo(reactivo_id: int, db: Session = Depends(get_db)):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    return reactivo

@router.put("/reactivos/{reactivo_id}", response_model=schemas.ReactivoRespuesta)
def actualizar_reactivo(reactivo_id: int, datos: schemas.ReactivoCrear, db: Session = Depends(get_db)):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    for campo, valor in datos.model_dump().items():
        setattr(reactivo, campo, valor)
    db.commit()
    db.refresh(reactivo)
    return reactivo

@router.delete("/reactivos/{reactivo_id}")
def borrar_reactivo(reactivo_id: int, db: Session = Depends(get_db), usuario_actual = Depends(obtener_usuario_actual)):
    if usuario_actual.rol not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden borrar reactivos")
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    db.delete(reactivo)
    db.commit()
    return {"mensaje": f"Reactivo {reactivo_id} eliminado correctamente"}

@router.post("/reactivos/{reactivo_id}/fds")
async def subir_fds(reactivo_id: int, archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    if not archivo.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")
    os.makedirs("uploads", exist_ok=True)
    ruta = f"uploads/{reactivo_id}_{archivo.filename}"
    with open(ruta, "wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)
    reactivo.fds_pdf = ruta
    db.commit()
    db.refresh(reactivo)
    return {"mensaje": "FDS subida correctamente", "ruta": ruta}

@router.get("/reactivos/{reactivo_id}/fds")
def descargar_fds(reactivo_id: int, db: Session = Depends(get_db)):
    reactivo = db.query(models.Reactivo).filter(models.Reactivo.id == reactivo_id).first()
    if reactivo is None:
        raise HTTPException(status_code=404, detail="Reactivo no encontrado")
    if reactivo.fds_pdf is None:
        raise HTTPException(status_code=404, detail="Este reactivo no tiene FDS asociada")
    return FileResponse(reactivo.fds_pdf, media_type="application/pdf", filename=f"FDS_{reactivo.nombre}.pdf")