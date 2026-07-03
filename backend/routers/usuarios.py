from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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

@router.get("/usuarios", response_model=list[schemas.UsuarioRespuesta])
def listar_usuarios(db: Session = Depends(get_db), usuario_actual = Depends(obtener_usuario_actual)):
    if usuario_actual.rol not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Sin permisos para ver usuarios")
    return db.query(models.Usuario).all()

@router.delete("/usuarios/{usuario_id}")
def borrar_usuario(usuario_id: int, db: Session = Depends(get_db), usuario_actual = Depends(obtener_usuario_actual)):
    if usuario_actual.rol != "superadmin":
        raise HTTPException(status_code=403, detail="Solo el superadmin puede borrar usuarios")
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"mensaje": f"Usuario {usuario_id} eliminado correctamente"}