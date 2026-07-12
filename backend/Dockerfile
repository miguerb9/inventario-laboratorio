FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD python -c "from database import engine, Base; import models; Base.metadata.create_all(bind=engine)" && alembic stamp head && uvicorn main:app --host 0.0.0.0 --port $PORTCMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT