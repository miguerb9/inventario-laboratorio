from fastapi import FastAPI
from database import engine, Base
import models
import os
from routers import reactivos, auth, alertas, usuarios
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)


app = FastAPI(docs_url=None, redoc_url=None) if os.getenv("RENDER") else FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://inventario-laboratorio-ten.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reactivos.router)
app.include_router(auth.router)
app.include_router(alertas.router)
app.include_router(usuarios.router)