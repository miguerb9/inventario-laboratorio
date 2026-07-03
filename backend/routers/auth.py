from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models
import schemas
from database import SessionLocal
from auth import hashear_password, verificar_password, crear_token, obtener_usuario_actual

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/registro", response_model=schemas.UsuarioRespuesta)
def registro(usuario: schemas.UsuarioCrear, db: Session = Depends(get_db)):
    existe = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    nuevo = models.Usuario(
        email=usuario.email,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        hashed_password=hashear_password(usuario.password),
        rol=usuario.rol
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    if not usuario or not verificar_password(form_data.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    token = crear_token({"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UsuarioRespuesta)
def mi_perfil(usuario_actual = Depends(obtener_usuario_actual)):
    return usuario_actual