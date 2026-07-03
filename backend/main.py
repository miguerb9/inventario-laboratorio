from fastapi import FastAPI
from database import engine, Base
import models
from routers import reactivos, auth, alertas, usuarios

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(reactivos.router)
app.include_router(auth.router)
app.include_router(alertas.router)
app.include_router(usuarios.router)