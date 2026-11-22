# Poner Mencion en funcionamiento

Hay tres etapas: 1) probar con datos reales en tu computadora, 2) publicar la app en menciones.org y 3) automatizar la
medición diaria.

---

## 1. Probar con datos reales en tu computadora

### 1.1 Crear la cuenta de DataForSEO
1. Regístrate en https://app.dataforseo.com/register.
2. Revisa en el panel el crédito de prueba y el depósito mínimo (pueden cambiar; confírmalos ahí).
3. Ve a **API Access** (https://app.dataforseo.com/api-access) y copia tu **API login** y **API password**.
   No son tu email ni la contraseña con la que entras al panel.

### 1.2 Configurar `.env`
En la carpeta `mencion`, edita `.env`:

```
DATAFORSEO_LOGIN=tu_api_login
DATAFORSEO_PASSWORD=tu_api_password
```

Opcional, para el análisis de sentimiento: `ANTHROPIC_API_KEY=` con una clave de https://platform.claude.com.

### 1.3 Confirmar los modelos disponibles
```bash
npm run models
```
Si `MODEL_CLAUDE`, `MODEL_GEMINI` o `MODEL_PERPLEXITY` en `.env` no aparecen en la lista, cámbialos por uno que sí
aparezca y, de preferencia, que diga "(web search)".

### 1.4 Primera medición
```bash
npm run dev
```
1. Abre http://localhost:3030.
2. Crea un proyecto con tu marca, tu dominio, 2 o 3 competidores y 3 a 5 prompts.
3. Pulsa **Ejecutar ahora**. Tarda 1–3 minutos y la página se actualiza sola.
4. Si una IA marca **error**, abre esa celda: el mensaje dice qué falló (modelo inválido, saldo, etc.).

---

## 2. Publicar en menciones.org (Railway)

Mencion es un sitio web: los usuarios entran desde el navegador, sin instalar nada. Para funcionar necesita un servidor
Node siempre encendido, porque las mediciones trabajan en segundo plano, y un disco para la base de datos SQLite.
Railway ofrece las dos cosas sin cambiar código. El hosting compartido (Banahosting, cPanel) no sirve para la app,
aunque puedes seguir usándolo para el DNS del dominio. Vercel tampoco sirve tal como está: es serverless y corta las
mediciones a la mitad.

### 2.1 Crear el servicio
1. Entra a https://railway.com con tu cuenta de GitHub. El plan Hobby es de pago, con un mínimo mensual bajo.
2. **New Project → Deploy from GitHub repo →** `miguelhuahuala/mencion`.
3. En el servicio: **Settings → Volumes → Add Volume**, con *Mount path* `/data`.

### 2.2 Variables de entorno (pestaña *Variables*)
| Variable | Valor |
|---|---|
| `DATABASE_URL` | `file:/data/mencion.db` |
| `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` | tus credenciales de API |
| `ADMIN_EMAILS` | tu correo; esa cuenta no tiene límites y hereda los proyectos creados antes de las cuentas |
| `FREE_MAX_PROJECTS` / `FREE_MAX_PROMPTS` / `FREE_RUN_INTERVAL_DAYS` | `1` / `5` / `7` (plan gratis) |
| `MAX_MONTHLY_SPEND_USD` | tope mensual de gasto en DataForSEO, por ejemplo `30`; al llegar, se pausan las mediciones gratis |
| `CRON_SECRET` | resultado de `openssl rand -hex 24` |
| `ALLOW_INDEXING` | `true` para que Google indexe la landing |
| `CONTACT_EMAIL` | correo para solicitudes de privacidad (Ley 29733), p. ej. `contacto@menciones.org` |
| `SITE_URL` | `https://menciones.org` |
| `MODEL_CLAUDE`, `MODEL_GEMINI`, `MODEL_PERPLEXITY` | los mismos que validaste en el paso 1.3 |
| `ANTHROPIC_API_KEY` | opcional |
| `SHOW_DEMO_DATA` | `false` (o `true` si cargas la demo) |

Railway detecta Node y ejecuta `npm run build` y luego `npm start`. `npm start` aplica las migraciones a la base del
volumen y levanta la app en el puerto que asigna Railway.

No definas `APP_PASSWORD` si quieres que el sitio sea público: esa variable protege todo el sitio con una sola
contraseña y solo sirve para un entorno de pruebas.

### 2.3 Comprobar
1. En **Settings → Networking → Generate Domain** obtienes una URL `*.up.railway.app`. Ábrela y verás la landing.
2. Crea tu cuenta con el correo que pusiste en `ADMIN_EMAILS`; aparecerá con la etiqueta **admin**.

### 2.4 Conectar menciones.org
1. Si todavía no tienes el dominio, cómpralo (Cloudflare, Namecheap, Porkbun, etc.).
2. En Railway: **Settings → Networking → Custom Domain →** `menciones.org`. Railway te muestra un registro DNS.
3. Crea ese registro en tu proveedor de DNS. Para el dominio raíz (`menciones.org`, sin `www`) el proveedor debe
   aceptar CNAME en la raíz (lo llaman "CNAME flattening" o "ALIAS"); Cloudflare lo hace gratis. Agrega también
   `www.menciones.org` si lo quieres.
4. Espera a que Railway marque el dominio como verificado. El certificado HTTPS es automático.

---

## 3. Medición diaria automática

El repo trae `.github/workflows/corrida-diaria.yml`, que llama a `/api/cron` todos los días a las 7:00 (hora de Perú).
Cada proyecto se mide según el plan de su dueño: los del plan gratis, cada 7 días; los del administrador, a diario.

1. En GitHub: **mencion → Settings → Secrets and variables → Actions → New repository secret**:
   - `MENCION_URL` = `https://menciones.org`
   - `CRON_SECRET` = el mismo valor que pusiste en Railway
2. Pruébalo en **Actions → Corrida diaria → Run workflow**. Debe responder `{"results":[...]}`.

---

## Costo estimado mensual
- **DataForSEO, medido el 22-nov-2026 con Claude Haiku:** unos $0.04 por prompt en las 4 IAs. Cada usuario gratis
  (5 prompts, semanal) cuesta unos $0.20 por semana, menos de $1 al mes. `MAX_MONTHLY_SPEND_USD` pone un tope.
- **Railway:** plan Hobby.
- **Dominio:** pago anual según el proveedor.
- **Claude (sentimiento):** opcional; pocos centavos por corrida.

## Problemas frecuentes
| Síntoma | Causa probable |
|---|---|
| Botón "Ejecutar ahora" gris | ya hubo una medición esta semana (plan gratis), se llegó al tope mensual o faltan las credenciales de DataForSEO |
| Error `40501` / "Invalid Field" en una IA | modelo no válido: corre `npm run models` y actualiza la variable |
| Error de saldo | recarga créditos en DataForSEO |
| Los datos desaparecen tras desplegar | el volumen no está montado en `/data` o `DATABASE_URL` no apunta ahí |
| Una corrida quedó "Ejecutando…" | el servidor se reinició a mitad de la corrida; a los 30 min se marca fallida y puedes volver a lanzarla |
