# Stockix — Gestor de Inventario de Reactivos de Laboratorio

Aplicación web fullstack para la gestión de inventario de reactivos químicos en laboratorios. Desarrollada como proyecto de portfolio por un químico en transición al desarrollo de software.

## ¿Qué hace?

- Inventario completo de reactivos con control de stock y fechas de caducidad
- Alertas automáticas de reactivos caducados, próximos a caducar y con stock bajo
- Subida y consulta de Fichas de Seguridad (FDS) en PDF asociadas a cada reactivo
- Sistema de autenticación con JWT y tres roles: viewer, admin y superadmin
- Panel de gestión de usuarios (solo superadmin)

## Stack tecnológico

**Backend:** Python 3.14 · FastAPI · SQLAlchemy · PostgreSQL · Alembic · JWT

**Frontend:** React · Vite · Tailwind CSS · Axios

**Infraestructura:** Docker · Docker Compose

## Cómo ejecutarlo en local

### Requisitos
- Python 3.10+
- Node.js 18+
- Docker y Docker Compose

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Crea un archivo `backend/.env` con:
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/inventario_lab
SECRET_KEY=tu_clave_secreta

Levanta la base de datos:

```bash
cd ..
docker compose up -d
```

Aplica las migraciones y arranca el servidor:

```bash
cd backend
alembic upgrade head
uvicorn main:app --reload
```

La API estará disponible en `http://localhost:8000` y la documentación en `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| viewer | Consultar inventario y alertas |
| admin | Todo lo anterior + crear, editar y borrar reactivos |
| superadmin | Todo lo anterior + gestión completa de usuarios |

## Autor

Miguel — Químico · Técnico DAW 
[LinkedIn] => https://linkedin.com/in/tu-perfil
[GitHub] => https://github.com/miguerb9
