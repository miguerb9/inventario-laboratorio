# 🧪 Stockix — Gestor de Inventario de Reactivos de Laboratorio

Aplicación web fullstack para gestionar el inventario de reactivos químicos de un laboratorio. Permite controlar el stock, las fechas de caducidad, las fichas de seguridad (FDS) y los usuarios mediante autenticación por roles.

Este proyecto forma parte de mi portfolio como desarrollador y está basado en un caso de uso relacionado con mi experiencia previa en el ámbito de la química.

🔗 **Demo en vivo:** https://inventario-laboratorio-ten.vercel.app

---

## 📋 Índice

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Despliegue](#-despliegue)
- [Roles de usuario](#-roles-de-usuario)
- [Ejecución en local](#-ejecución-en-local)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [API](#-api)
- [Posibles mejoras](#-posibles-mejoras)
- [Autor](#-autor)

---

## 📖 Sobre el proyecto

Stockix nace como un proyecto para practicar el desarrollo de una aplicación fullstack completa utilizando **FastAPI** y **React**.

En lugar de crear una aplicación genérica de gestión, decidí desarrollar una herramienta basada en un problema real: el control del inventario de reactivos químicos en un laboratorio. De esta forma pude aprovechar mi experiencia previa en el sector mientras trabajaba aspectos como la autenticación, la autorización por roles, la gestión de archivos, el consumo de APIs REST y el despliegue en producción.

---

## 🚀 Funcionalidades

- Gestión completa de reactivos (crear, editar, eliminar y consultar).
- Control de cantidad, unidad, stock mínimo y fecha de caducidad.
- Alertas automáticas para:
  - Reactivos con stock por debajo del mínimo.
  - Reactivos próximos a caducar (30 días).
  - Reactivos ya caducados.
- Subida y descarga de fichas de seguridad (FDS) en formato PDF.
- Validación del tipo de archivo antes de almacenar la FDS.
- Autenticación mediante JWT.
- Autorización basada en roles (`viewer`, `admin` y `superadmin`).
- Gestión de usuarios para administradores.
- Dashboard con resumen del estado del inventario.
- Interfaz responsive adaptada a móvil y escritorio.

---

## 🛠 Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Backend** | Python, FastAPI, SQLAlchemy, PostgreSQL, Alembic, python-jose (JWT), bcrypt |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Lucide React |
| **Infraestructura** | Docker, Docker Compose, Render, Vercel |

---

## 🏗 Arquitectura

```text
┌─────────────┐        HTTPS / JSON       ┌──────────────┐        SQL        ┌─────────────┐
│  Frontend   │ ───────────────────────► │   Backend    │ ─────────────────► │ PostgreSQL  │
│ React + Vite│ ◄─────────────────────── │   FastAPI    │ ◄───────────────── │             │
└─────────────┘        JWT Bearer         └──────────────┘                    └─────────────┘
                                                  │
                                                  ▼
                                           uploads/ (PDF FDS)
```

El backend expone una API REST organizada en distintos routers (`auth`, `reactivos`, `alertas` y `usuarios`).

El frontend consume la API mediante Axios y gestiona el estado remoto utilizando TanStack Query.

---

## ☁️ Despliegue

La aplicación está desplegada en producción utilizando dos servicios:

- **Frontend:** Vercel
- **Backend:** Render
- **Base de datos:** PostgreSQL

El frontend se comunica con el backend mediante la variable de entorno `VITE_API_URL`.

En producción la documentación automática de FastAPI (`/docs` y `/redoc`) está deshabilitada para evitar exponer la API públicamente.

---

## 👥 Roles de usuario

| Rol | Permisos |
|------|----------|
| **viewer** | Consultar reactivos y alertas |
| **admin** | Crear, editar y eliminar reactivos |
| **superadmin** | Gestión completa de reactivos y usuarios |

---

## 💻 Ejecución en local

### Requisitos

- Python 3.10 o superior
- Node.js 18 o superior
- Docker
- Docker Compose

### Backend

Crear un entorno virtual e instalar las dependencias:

```bash
cd backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

Crear un archivo `.env` dentro de `backend/`:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/inventario_lab
SECRET_KEY=tu_clave_secreta
```

Levantar la base de datos:

```bash
cd ..

docker compose up -d
```

Aplicar las migraciones:

```bash
cd backend

alembic upgrade head
```

Iniciar el servidor:

```bash
uvicorn main:app --reload
```

La API estará disponible en:

```
http://localhost:8000
```

Y la documentación interactiva en:

```
http://localhost:8000/docs
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

---

## 📁 Estructura del proyecto

```text
inventario-lab/
├── backend/
│   ├── alembic/
│   ├── routers/
│   │   ├── alertas.py
│   │   ├── auth.py
│   │   ├── reactivos.py
│   │   └── usuarios.py
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
│
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        └── ...
```

---

## 🔌 API

Principales endpoints:

| Método | Endpoint | Descripción | Autenticación |
|---------|----------|-------------|----------------|
| POST | `/registro` | Crear usuario | No |
| POST | `/login` | Obtener token JWT | No |
| GET | `/me` | Perfil del usuario | Sí |
| GET | `/reactivos` | Listar reactivos | Sí |
| POST | `/reactivos` | Crear reactivo | Sí |
| PUT | `/reactivos/{id}` | Actualizar reactivo | Sí |
| DELETE | `/reactivos/{id}` | Eliminar reactivo | Admin / Superadmin |
| POST | `/reactivos/{id}/fds` | Subir ficha de seguridad | Sí |
| GET | `/reactivos/{id}/fds` | Descargar ficha de seguridad | Sí |
| GET | `/alertas` | Obtener alertas | Sí |
| GET | `/usuarios` | Listar usuarios | Admin / Superadmin |
| PUT | `/usuarios/{id}` | Modificar usuario | Superadmin |
| DELETE | `/usuarios/{id}` | Eliminar usuario | Superadmin |

---

## 📌 Posibles mejoras

- Exportación del inventario a Excel y PDF.
- Historial de movimientos de stock.
- Registro de auditoría (quién modifica cada reactivo y cuándo).
- Notificaciones por correo para alertas de caducidad.
- Búsqueda y filtrado avanzado.
- Tests automatizados con Pytest y Vitest.

---

## 👤 Autor

**Miguel Ángel Román Bueno**

Químico · Técnico Superior en Desarrollo de Aplicaciones Web

- GitHub: https://github.com/miguerb9
- LinkedIn: https://www.linkedin.com/in/miguel-ángel-román-bueno-3b9469244