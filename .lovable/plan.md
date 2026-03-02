

## Pasos Detallados para Conectar Google Email (Gmail) al Sistema Calsan

El sistema ya tiene toda la infraestructura de código lista. Lo que falta son **3 secrets** en la configuración del backend y la **configuración en Google Cloud Console**. Aquí van los pasos exactos:

---

### PASO 1 — Crear un Proyecto en Google Cloud Console

1. Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Si ya tienes un proyecto para Calsan, selecciónalo. Si no, haz clic en **"New Project"** → nómbralo "Calsan Dumpsters" → **Create**

---

### PASO 2 — Habilitar las APIs Necesarias

1. En el menú lateral, ve a **APIs & Services → Library**
2. Busca y habilita cada una de estas APIs (clic en cada una → **Enable**):
   - **Gmail API** — para enviar/leer correos
   - **Google Calendar API** — para crear reuniones Meet
   - **Google Drive API** — para carpetas de órdenes
   - **Google Analytics Data API** — para métricas GA4
   - **Search Console API** — para datos GSC
   - **My Business Business Information API** — para Google Business Profile

---

### PASO 3 — Configurar la Pantalla de Consentimiento (OAuth Consent Screen)

1. Ve a **APIs & Services → OAuth consent screen**
2. Selecciona **Internal** (solo usuarios de `@calsandumpsterspro.com`) o **External** si necesitas usuarios externos
3. Llena los campos:
   - **App name**: `Calsan Dumpsters Pro`
   - **User support email**: tu email de admin
   - **Authorized domains**: `calsandumpsterspro.com`
   - **Developer contact**: tu email
4. En **Scopes**, agrega:
   - `email`, `profile`, `openid`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/drive.file`
5. Guarda

---

### PASO 4 — Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services → Credentials**
2. Clic en **Create Credentials → OAuth client ID**
3. Tipo de aplicación: **Web application**
4. Nombre: `Calsan CRM`
5. En **Authorized redirect URIs**, agrega exactamente:
   ```
   https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/google-oauth-callback
   ```
6. Clic en **Create**
7. Aparecerá una ventana con:
   - **Client ID** — cópialo (ejemplo: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** — cópialo (ejemplo: `GOCSPX-xxxxxx`)

---

### PASO 5 — Generar la Clave de Encriptación

El sistema encripta los tokens de Google antes de guardarlos. Necesitas una clave aleatoria de 32+ caracteres.

Puedes generarla con este comando en terminal:
```bash
openssl rand -base64 32
```
O simplemente inventa una cadena larga y aleatoria, por ejemplo:
```
k9Xm2pL7qR4wT8vN1bJ6cF3hA5dG0eYs
```

---

### PASO 6 — Agregar los 3 Secrets al Proyecto

Una vez que tengas los 3 valores, yo los agregaré al backend del proyecto. Los secrets necesarios son:

| Secret | Valor |
|--------|-------|
| `GOOGLE_CLIENT_ID` | El Client ID del paso 4 |
| `GOOGLE_CLIENT_SECRET` | El Client Secret del paso 4 |
| `GOOGLE_ENCRYPTION_KEY` | La clave del paso 5 |

---

### PASO 7 — Probar la Conexión

1. Inicia sesión en el CRM como admin
2. Ve a **Admin → Google Setup** (`/admin/google/setup`)
3. Haz clic en **"Connect Google"**
4. Se abrirá una ventana de Google pidiendo permisos
5. Autoriza con tu cuenta `@calsandumpsterspro.com`
6. La ventana se cierra y aparece tu email conectado con un badge verde

---

### PASO 8 — Verificar que Gmail Funciona

1. Ve a la sección de envío de emails en el CRM
2. Envía un correo de prueba
3. Verifica que llega al destinatario
4. El sistema usa la función `google-send-email` que ya está desplegada

---

### Resumen de lo que Falta

Lo único que necesitas hacer es:
1. Configurar Google Cloud Console (pasos 1-5) — esto es en la consola de Google, no en Lovable
2. Darme los 3 valores para que los guarde como secrets (paso 6)
3. Probar (pasos 7-8)

¿Tienes acceso a Google Cloud Console con la cuenta de `@calsandumpsterspro.com`? Si me confirmas, procedo a crear los campos para que ingreses los secrets.

