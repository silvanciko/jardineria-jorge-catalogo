# Jardinería Jorge — Catálogo

## Estado actual (Fase 2 en progreso)

✅ Sitio público (`index.html`) — sin ningún rastro de administración.
✅ Login real en `/admin` — contraseña verificada en el servidor, sesión con cookie firmada httpOnly.
✅ Backend de datos (`/api/data`, `/api/save`) conectado a Vercel KV.
✅ Subida de imágenes (`/api/upload`) conectada a Vercel Blob.
⏳ Pendiente: conectar el sitio público a `/api/data` (hoy usa `js/productos.js` estático) y construir los formularios de edición del dashboard para cada sección (productos, categorías, servicios, textos, footer, logo).

---

## Cómo desplegarlo en Vercel

### 1. Crea el proyecto
Sube esta carpeta a un repositorio de GitHub y conéctalo en [vercel.com/new](https://vercel.com/new), o usa `vercel` (Vercel CLI) directamente desde esta carpeta.

### 2. Crea el almacenamiento (2 minutos)
En el panel de tu proyecto en Vercel:
- **Storage → Create Database → KV** (guarda el catálogo).
- **Storage → Create Database → Blob** (guarda las fotos).

Al conectarlos, Vercel agrega automáticamente las variables `KV_REST_API_URL`, `KV_REST_API_TOKEN` y `BLOB_READ_WRITE_TOKEN` — no las escribas a mano.

### 3. Genera tu contraseña de administrador
En tu computadora (con Node.js instalado):
```bash
node scripts/hash-password.js "la-contraseña-que-quieras-usar"
```
Copia el resultado.

### 4. Configura las variables de entorno
En Vercel → tu proyecto → Settings → Environment Variables, agrega:
- `ADMIN_PASSWORD_HASH` → el resultado del paso 3.
- `SESSION_SECRET` → cualquier texto largo y aleatorio, por ejemplo:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 5. Deploy
Vercel instala `@vercel/kv` y `@vercel/blob` solo (están en `package.json`), detecta la carpeta `api/` como funciones automáticamente, y sirve `index.html` y `admin/` como archivos estáticos. No necesitas tocar nada más.

### 6. Entra a tu panel
`https://tu-sitio.vercel.app/admin` — ingresa con la contraseña que elegiste en el paso 3.

---

## Estructura del proyecto
```
index.html              sitio público
styles.css               estilos del sitio público
js/productos.js          datos del catálogo (próximo paso: vendrá de /api/data)
js/script.js              lógica del sitio público (sin nada de administración)
assets/images/logo.png
data/seed.json            catálogo de ejemplo (respaldo si Vercel KV está vacío)
admin/                    panel privado (login + dashboard)
api/                      funciones serverless (login, sesión, datos, guardado, subida de imágenes)
scripts/hash-password.js  genera el hash de tu contraseña
```

## Seguridad — qué se hizo y por qué
- La contraseña **nunca** está en el código: solo su hash (irreversible), guardado como variable de entorno.
- El login ocurre en el servidor (`api/login.js`), no en el navegador.
- La sesión es una cookie `httpOnly` + `Secure` + firmada con HMAC — JavaScript del navegador no puede leerla ni falsificarla.
- Cada endpoint que modifica datos (`/api/save`, `/api/upload`) exige esa sesión antes de responder.
- `/admin` tiene `noindex` para no aparecer en buscadores (esto es cortesía, no seguridad real — la seguridad real es el login).
