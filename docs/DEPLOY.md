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

La app necesita un servidor Node que siga encendido, porque las corridas trabajan en segundo plano, y un disco para la
base SQLite. Railway ofrece las dos cosas sin cambiar código. Vercel no sirve tal como está: es serverless y corta
las corridas a la mitad.

### 2.1 Crear el servicio
1. Entra a https://railway.com con tu cuenta de GitHub. El plan Hobby es de pago, con un mínimo mensual bajo.
2. **New Project → Deploy from GitHub repo →** `miguelhuahuala/mencion`.
3. En el servicio: **Settings → Volumes → Add Volume**, con *Mount path* `/data`.

### 2.2 Variables de entorno (pestaña *Variables*)
| Variable | Valor |
|---|---|
| `DATABASE_URL` | `file:/data/mencion.db` |
| `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` | tus credenciales de API |
| `APP_PASSWORD` | una contraseña larga; **obligatoria**, sin ella cualquiera gasta tus créditos |
| `CRON_SECRET` | resultado de `openssl rand -hex 24` |
| `SITE_URL` | `https://menciones.org` |
| `MODEL_CLAUDE`, `MODEL_GEMINI`, `MODEL_PERPLEXITY` | los mismos que validaste en el paso 1.3 |
| `ANTHROPIC_API_KEY` | opcional |
| `SHOW_DEMO_DATA` | `false` (o `true` si cargas la demo) |

Railway detecta Node y ejecuta `npm run build` y luego `npm start`. `npm start` aplica las migraciones a la base del
volumen y levanta la app en el puerto que asigna Railway.

### 2.3 Comprobar
En **Settings → Networking → Generate Domain** obtienes una URL `*.up.railway.app`. Al abrirla, el navegador te pide
usuario y contraseña: el usuario puede ser cualquiera y la contraseña es `APP_PASSWORD`.

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

1. En GitHub: **mencion → Settings → Secrets and variables → Actions → New repository secret**:
   - `MENCION_URL` = `https://menciones.org`
   - `CRON_SECRET` = el mismo valor que pusiste en Railway
2. Pruébalo en **Actions → Corrida diaria → Run workflow**. Debe responder `{"started":[...]}`.

---

## Costo estimado mensual
- **DataForSEO:** prompts × 4 IAs × 30 días. Con 10 prompts son unas 1.200 consultas; el costo real de cada corrida
  aparece en el dashboard.
- **Railway:** plan Hobby.
- **Dominio:** pago anual según el proveedor.
- **Claude (sentimiento):** opcional; pocos centavos por corrida.

## Problemas frecuentes
| Síntoma | Causa probable |
|---|---|
| Botón "Ejecutar ahora" gris | faltan `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` |
| Error `40501` / "Invalid Field" en una IA | modelo no válido: corre `npm run models` y actualiza la variable |
| Error de saldo | recarga créditos en DataForSEO |
| Los datos desaparecen tras desplegar | el volumen no está montado en `/data` o `DATABASE_URL` no apunta ahí |
| Una corrida quedó "Ejecutando…" | el servidor se reinició a mitad de la corrida; a los 30 min se marca fallida y puedes volver a lanzarla |
