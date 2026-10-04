# 🚀 Fase 2: Filtro MOFU & Captura en la Nube
## Unidad Educativa Agustín Cueva Dávila (Ibarra, Ecuador)
### Metodología: Vibe Coding (Modern Full Stack + Growth Hacking + UX)

Este repositorio contiene la arquitectura completa de la **Landing Page de Conversión (Mobile-First)** para la Unidad Educativa "Agustín Cueva Dávila", construida a partir de los hallazgos de investigación de mercado de la **Fase 1 (Apify / Google Maps Reviews)** e integrada con **Supabase Cloud** y lista para despliegue en **Vercel**.

---

## 📌 1. Insumos Estratégicos de la Fase 1

- **Institución:** Unidad Educativa "Agustín Cueva Dávila" (Ibarra, Ecuador).
- **Propuesta Única de Valor (PUV):**  
  > *"En la Unidad Educativa 'Agustín Cueva Dávila', cada estudiante importa igual: el entorno es seguro, el trato es justo y el aprendizaje ocurre en espacios dignos."*
- **Los 3 Core Pains Resueltos (Anti-Pain Web Architecture):**
  1. **Inseguridad interna, robos y condiciones físicas deficientes:** Resuelto en la web con protocolos de control de acceso, presencia docente activa y cero impunidad.
  2. **Discriminación hacia bachilleres técnicos:** Resuelto con equiparación de prestigio entre Bachillerato Técnico y Ciencias, talleres funcionales y proyección laboral.
  3. **Infraestructura deteriorada como barrera educativa:** Resuelto con garantía de espacios limpios, remodelación continua y política de *Puertas Abiertas*.

---

## 🏗️ 2. Estructura del Proyecto

```text
landing-agustin-cueva/
├── index.html            # Landing page mobile-first (Tailwind CSS, Hero PUV, Matriz de Dolores, RTB)
├── config.js             # Configuración centralizada de Supabase y reglas MOFU
├── supabase-client.js    # Cliente REST HTTPS para inserción segura de leads
├── app.js                # Validación UX, dynamic qualification scoring y flujo WhatsApp
├── vercel.json           # Configuración de producción para Vercel (Security headers, clean URLs)
├── .env.example          # Plantilla de variables de entorno
└── supabase/
    └── schema.sql        # DDL completo: Tabla 'leads', índices, RLS y vista analítica
```

---

## 🗄️ 3. Configuración del Backend en Supabase

1. Crea o ingresa a tu proyecto en [Supabase](https://supabase.com).
2. Dirígete a la pestaña **SQL Editor**.
3. Abre y copia el contenido del archivo `supabase/schema.sql` y ejecútalo (**Run**).
4. El script creará:
   - Tabla `public.leads` con los 6 campos requeridos (`full_name`, `email`, `whatsapp`, `company`, `estimated_budget`, `primary_pain`).
   - Políticas de seguridad **Row Level Security (RLS)** que permiten inserción pública segura (`anon`) y lectura exclusiva para administradores autenticados.
   - Índices de alto rendimiento y la vista `v_leads_mofu_metrics`.
5. Ve a **Project Settings -> API** y copia:
   - **Project URL** (ej: `https://xyzproject.supabase.co`)
   - **Project API Keys -> `anon` / `public`**

---

## ⚙️ 4. Conexión de Credenciales (2 Formas Sencillas)

### Opción A: Desde la propia Landing Page (Sin tocar código)
1. Abre `index.html` en tu navegador.
2. Haz clic en el botón superior **"Supabase Config"**.
3. Pega tu URL y anon key y presiona **"Guardar y Conectar"**.
4. ¡Listo! Quedará guardado en tu navegador para todas las pruebas.

### Opción B: En `config.js`
Edita las primeras líneas de `config.js`:
```javascript
SUPABASE_URL: "https://tu-proyecto.supabase.co",
SUPABASE_ANON_KEY: "tu-anon-key-aqui"
```

---

## 🚀 5. Despliegue en Vercel (Paso a Paso)

### Vía GitHub (Recomendado):
1. Inicializa el repositorio Git en la carpeta del proyecto:
   ```powershell
   git init
   git add .
   git commit -m "feat: Fase 2 Landing Page MOFU y conexion Supabase"
   ```
2. Crea un repositorio en GitHub (con tu cuenta conectada `marcelito-galy`) y sube el código:
   ```powershell
   gh repo create landing-agustin-cueva --public --source=. --push
   ```
3. Ingresa a [Vercel](https://vercel.com) e importa el repositorio `landing-agustin-cueva`.
4. En la sección **Environment Variables**, añade:
   - `SUPABASE_URL` = Tu URL de Supabase
   - `SUPABASE_ANON_KEY` = Tu Anon Key de Supabase
5. Haz clic en **Deploy**. ¡Tu landing estará en vivo bajo HTTPS en segundos!

---

## 🎯 6. Mecanismo de Cualificación MOFU (Growth UX)

El formulario clasifica automáticamente los prospectos en base al campo **Presupuesto Estimado**:

| Rango Presupuestario | Clasificación MOFU | Acción Comercial |
|---|---|---|
| `Menor a $120 / mes` | `DISQUALIFIED` | Derivación a Comité de Beca Social (No satura admisiones) |
| `$120 - $220 / mes` | `TIER_B` | Calificado Regular: Visita guiada estándar |
| `$220 - $350 / mes` | `TIER_A` | Prioritario: Bachillerato Técnico / Avanzado |
| `Más de $350 / mes` | `TIER_A+` | VIP: Admisión Inmediata y atención personalizada |
