from fastapi import FastAPI
from database import engine, Base
import models

Base.metadata.create_all(bind=engine)
app = FastAPI()

@app.get("/")

def read_root():
    return {"mensaje": "El inventario está funcionando"}
