# 🚀 Landing Page Oficial de Admisiones
## Unidad Educativa "Agustín Cueva Dávila" (Ibarra, Ecuador)
### Identidad Visual Oficial: Verde Oscuro (`#0B3B2C`), Azul Marino (`#0A192F`) y Blanco Puro

Esta Landing Page de conversión (Mobile-First) está diseñada para el proceso de admisiones de la Unidad Educativa "Agustín Cueva Dávila", con soporte completo para la inserción de fotografías reales de la institución y el logotipo oficial, conectada a **Supabase Cloud** y lista para despliegue en **Vercel**.

---

## 🎨 1. Paleta de Colores Institucionales Oficial

| Color | Código HEX | Rol en la Interfaz |
|---|---|---|
| **Verde Oscuro Institucional** | `#0B3B2C` / `#135D43` | Color primario de acción: Botones principales CTA, encabezados de confianza, bordes de seguridad y botón flotante. |
| **Azul Marino Oscuro** | `#0A192F` / `#0F2C59` | Color base y estructural: Barra de navegación (Navbar), fondos oscuros del Hero y pie de página institucional. |
| **Blanco Puro y Grises Suaves** | `#FFFFFF` / `#F8FAFC` | Fondos de alto contraste, tarjetas de contenido, inputs del formulario y contenedores de texto limpios. |
| **Acento Dorado Académico** | `#F59E0B` / `#FCD34D` | Estrellas de valoración, sellos de calidad y laureles del emblema. |

---

## 🖼️ 2. Cómo Insertar tu Logotipo Oficial

El proyecto ya cuenta con un escudo institucional en formato vectorial (`assets/logo-acd.svg`). Para colocar tu archivo PNG oficial:

1. Guarda tu imagen de logotipo con el nombre:
   `logo-acd.png`
2. Cópiala dentro de la carpeta:
   `assets/logo-acd.png` (o en la raíz del proyecto).
3. La etiqueta `<img>` en `index.html` ya está programada para cargarlo automáticamente con fallback transparente:
   ```html
   <img 
       src="assets/logo-acd.png" 
       onerror="this.onerror=null; this.src='assets/logo-acd.svg';" 
       alt="Unidad Educativa Agustín Cueva Dávila" 
       class="h-11 sm:h-12 md:h-14 w-auto object-contain"
   />
   ```

---

## 📸 3. Dónde Subir las Fotografías Reales de la Institución

La sección **"Nuestras Instalaciones"** cuenta con etiquetas comentadas tanto en el **carrusel interactivo** como en la **galería de tarjetas de alta inspección**.

Simplemente copia tus fotos reales en la carpeta `assets/images/` (o en `images/`) reemplazando los siguientes nombres de archivo:

| Archivo | Espacio del Colegio | Dolor que Resuelve (Fase 1) |
|---|---|---|
| `assets/images/fachada-colegio.jpg` | Fachada / Entrada Principal | **Cero Inseguridad Interna:** Muestra el control perimetral y accesos vigilados. |
| `assets/images/aulas-laboratorios.jpg` | Aulas y Laboratorios Equipados | **Espacios Dignos:** Muestra salones iluminados, mobiliario ergonómico y limpieza. |
| `assets/images/estadio-deportes.jpg` | Estadio / Áreas Recreativas / Bastoneras | **Vida Estudiantil:** Destaca las canchas múltiples y actividades deportivas reconocidas en Ibarra. |
| `assets/images/actividades-tecnicas.jpg` | Talleres o Bachillerato Técnico | **Mismo Prestigio Académico:** Muestra las estaciones de cómputo, redes y proyectos productivos reales. |
| `assets/images/bar-comedor.jpg` | Bar Escolar y Comedor | **Salud y Bienestar:** Demuestra higiene estricta y alimentos frescos, desactivando el dolor del bar descuidado. |

---

## 📁 4. Estructura de Archivos

```text
landing-agustin-cueva/
├── index.html            # Landing page con paleta oficial, logo y carrusel/galería comentada
├── app.js                # Controlador UI (Tabs, Slider táctil, Reel Lightbox, Supabase MOFU)
├── config.js             # Configuración centralizada de Supabase
├── supabase-client.js    # Cliente REST HTTPS de inserción
├── vercel.json           # Configuración de producción para Vercel
├── assets/
│   ├── logo-acd.svg      # Emblema oficial vectorial
│   └── images/           # Carpeta para tus fotos reales
│       ├── fachada-colegio.jpg
│       ├── aulas-laboratorios.jpg
│       ├── estadio-deportes.jpg
│       ├── actividades-tecnicas.jpg
│       └── bar-comedor.jpg
└── supabase/
    └── schema.sql        # Script SQL completo de la tabla 'leads' y políticas RLS
```

---

## 🚀 5. Conexión con Supabase y Despliegue en Vercel

1. **Abrir en navegador:**
   Doble clic en `index.html` para previsualizar la página de inmediato.
2. **Conectar Supabase:**
   Haz clic en el botón superior **"Supabase"**, pega tu Project URL y Anon Key y presiona **Guardar y Conectar**.
3. **Subir a GitHub y Vercel:**
   ```powershell
   gh repo create landing-agustin-cueva --public --source=. --push
   ```
