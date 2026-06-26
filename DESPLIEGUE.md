# 🚀 Guía de Despliegue — Invent X Solutions

## Arquitectura Final

```
[Usuario] → [Vercel: frontend/] → HTTPS → [Railway: backend/] → [Railway: MySQL]
```

---

## PASO 1 — Preparar el repositorio

Crea un repositorio en GitHub con esta estructura:

```
inventx/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productosController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── productos.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── railway.toml
│   └── server.js
└── frontend/
    ├── index.html
    ├── login.html
    ├── logo.png          ← Copia tu logo.png aquí
    └── vercel.json
```

```bash
git init
git add .
git commit -m "Migración a web: Electron → Node.js/Express + Vercel"
git remote add origin https://github.com/TU_USUARIO/inventx.git
git push -u origin main
```

---

## PASO 2 — Desplegar la base de datos MySQL en Railway

1. Ve a https://railway.app y crea cuenta / inicia sesión
2. Clic en **"New Project"** → **"Deploy MySQL"**
3. Railway crea la base de datos automáticamente
4. En el panel de MySQL, copia las variables de conexión:
   - `MYSQL_HOST` → lo usarás como `DB_HOST`
   - `MYSQL_PORT` → `DB_PORT`
   - `MYSQL_DATABASE` → `DB_NAME`
   - `MYSQL_USER` → `DB_USER`
   - `MYSQL_PASSWORD` → `DB_PASSWORD`

---

## PASO 3 — Desplegar el backend en Railway

1. En el mismo proyecto de Railway, clic en **"New Service"** → **"GitHub Repo"**
2. Selecciona tu repositorio y la carpeta **`backend/`**
3. Railway detecta Node.js automáticamente
4. Ve a **"Variables"** y agrega estas variables de entorno:

```
DB_HOST        = (el host de tu MySQL en Railway)
DB_PORT        = 3306
DB_NAME        = railway         ← Railway crea una BD llamada "railway"
DB_USER        = root
DB_PASSWORD    = (la contraseña de tu MySQL en Railway)
JWT_SECRET     = una-cadena-larga-aleatoria-aqui-2026
FRONTEND_URL   = https://tu-app.vercel.app   ← lo añades después del paso 4
PORT           = 3000
```

5. Clic en **"Deploy"**. Railway hace el build y arranca el servidor.
6. En el panel del servicio, copia la **URL pública** del backend.
   Ejemplo: `https://inventx-production.up.railway.app`

---

## PASO 4 — Actualizar la URL del backend en el frontend

Abre `frontend/index.html` y `frontend/login.html` y reemplaza:

```javascript
// ANTES
const API_BASE = 'https://tu-backend.up.railway.app';

// DESPUÉS (pon la URL real que te dio Railway)
const API_BASE = 'https://inventx-production.up.railway.app';
```

Haz commit y push de los cambios.

---

## PASO 5 — Desplegar el frontend en Vercel

1. Ve a https://vercel.com y crea cuenta / inicia sesión
2. Clic en **"Add New Project"** → importa tu repositorio de GitHub
3. En la configuración:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Other (HTML estático)
   - No necesita variables de entorno
4. Clic en **"Deploy"**
5. Copia la URL que te da Vercel. Ejemplo: `https://inventx.vercel.app`

---

## PASO 6 — Actualizar CORS en Railway

Vuelve a Railway → Variables del backend y actualiza:

```
FRONTEND_URL = https://inventx.vercel.app
```

Redeploy el servicio.

---

## PASO 7 — Verificar el despliegue

Prueba estos endpoints del backend:

```bash
# Health check
curl https://TU-BACKEND.up.railway.app/health

# Login
curl -X POST https://TU-BACKEND.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user":"PAGINAWEB","pass":"lola123*"}'
```

---

## Usuarios disponibles

| Usuario     | Contraseña   |
|-------------|--------------|
| JULIANDEV   | 1037665127   |
| REMDEV      | 1000764800   |
| DANIELA     | 1038361327   |
| PAGINAWEB   | lola123*     |

---

## Esquema de la base de datos

La tabla se crea automáticamente al arrancar el servidor:

```sql
CREATE TABLE IF NOT EXISTS productos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  referencia VARCHAR(20) NOT NULL,
  talla      VARCHAR(5)  NOT NULL,
  cantidad   INT         NOT NULL,
  INDEX idx_referencia (referencia),
  INDEX idx_id_desc    (id DESC)
);
```

---

## API REST — Endpoints

| Método | Ruta                                      | Auth | Descripción                     |
|--------|-------------------------------------------|------|---------------------------------|
| GET    | `/health`                                 | No   | Estado del servidor             |
| POST   | `/api/auth/login`                         | No   | Login → devuelve JWT            |
| GET    | `/api/productos`                          | JWT  | Lista paginada con búsqueda     |
| POST   | `/api/productos`                          | JWT  | Crear producto                  |
| DELETE | `/api/productos/:id`                      | JWT  | Eliminar producto               |
| GET    | `/api/productos/ultima-referencia`        | JWT  | Última referencia guardada      |
| GET    | `/api/productos/ultima-referencia-blusas` | JWT  | Última ref. de blusas           |

### Query params de GET /api/productos:
- `pagina` (default: 1)
- `limite` (default: 50, max: 200)
- `busqueda` (filtra por referencia o talla)

---

## Desarrollo local

### Backend:
```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus datos locales de MySQL
npm run dev
```

### Frontend:
Abre `frontend/login.html` directamente en el navegador, o usa Live Server de VS Code.

Asegúrate de que `API_BASE` en los HTML apunte a `http://localhost:3000` para desarrollo local.

---

## Solución de problemas

**Error CORS**: Verifica que `FRONTEND_URL` en Railway tenga exactamente la URL de Vercel sin barra final.

**Token expirado**: El JWT dura 12 horas. El sistema redirige al login automáticamente.

**Error 503 en Railway**: El plan gratuito puede tener cold starts (el servidor "duerme" tras inactividad). El primer request puede tardar unos segundos.

**MySQL no conecta**: Verifica que las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` estén correctamente configuradas en Railway.
