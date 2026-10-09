/**
 * CONFIGURACIÓN CENTRALIZADA - UNIDAD EDUCATIVA AGUSTÍN CUEVA DÁVILA
 * 
 * En producción (Vercel), estos valores se pueden inyectar mediante variables
 * de entorno o dejarlos configurados aquí con tus credenciales de Supabase.
 */

const APP_CONFIG = {
    // URL de tu proyecto Supabase (compatible con Next.js Gravity, Vite y Vercel)
    SUPABASE_URL: window.ENV?.NEXT_PUBLIC_SUPABASE_URL ||
                  window.ENV?.SUPABASE_URL ||
                  window.ENV?.VITE_SUPABASE_URL ||
                  (typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL) : '') ||
                  "https://nkrbcmzgghjwimulpgpd.supabase.co",

    // Clave anónima pública (anon key) de Supabase
    SUPABASE_ANON_KEY: window.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                      window.ENV?.SUPABASE_ANON_KEY ||
                      window.ENV?.VITE_SUPABASE_ANON_KEY ||
                      (typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY) : '') ||
                      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcmJjbXpnZ2hqd2ltdWxwZ3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzM1MDEsImV4cCI6MjEwNjkwOTUwMX0.jIZmFPNm5Pn0d26rXR-qvglFU_nGpRO83FG-1u9dyQo",

    // Nombre exacto de la tabla en Supabase (public.leads)
    TABLE_NAME: "leads",

    // WhatsApp institucional de admisiones para cierre rápido
    WHATSAPP_NUMBER: "593959920177", // Formato internacional Ecuador

    // Video institucional (Ruta de archivo MP4 local o URL de YouTube / Vimeo)
    // 📁 Opción A (Archivo local): "assets/videos/video-institucional.mp4"
    // 🌐 Opción B (YouTube): "https://www.youtube.com/embed/TU_CODIGO_DE_VIDEO"
    INSTITUTIONAL_VIDEO_URL: window.ENV?.INSTITUTIONAL_VIDEO_URL || "assets/videos/video-institucional.mp4",

    // Configuración de rangos para descalificación MOFU (Growth Hacking)
    QUALIFICATION_RULES: {
        // Rangos considerados aptos / prioritarios
        HIGH_INTENT_BUDGETS: [
            "$120 - $220 / mes (Plan Estándar - Educación Integral)",
            "$220 - $350 / mes (Plan Avanzado - Técnico + Inglés Intensivo)",
            "Más de $350 / mes (Plan Premium - Todo Incluido)"
        ],
        // Rangos que requieren revisión especial o descalificación comercial directa
        DISQUALIFIED_BUDGET: "Menor a $120 / mes (Requiere análisis de Beca Social)"
    }
};

// Función de normalización de URL base de Supabase
function normalizeSupabaseBaseUrl(rawUrl) {
    if (!rawUrl) return "";
    let cleaned = rawUrl.trim().replace(/^["']|["']$/g, '');
    if (!cleaned || cleaned.includes("tu-proyecto")) return "https://tu-proyecto.supabase.co";

    if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
        if (/^[a-z0-9-]+$/i.test(cleaned)) {
            cleaned = `https://${cleaned}.supabase.co`;
        } else {
            cleaned = `https://${cleaned}`;
        }
    }

    try {
        const parsed = new URL(cleaned);
        return parsed.origin; // Retorna exclusivamente https://id-proyecto.supabase.co sin paths adicionales
    } catch (e) {
        return cleaned.replace(/\/rest\/v1.*$/i, '').replace(/\/+$/, '');
    }
}

// Función para extraer el Reference ID de Supabase desde el token JWT de la anon key
function extractProjectRefFromKey(jwt) {
    try {
        if (!jwt || typeof jwt !== 'string' || !jwt.includes('.')) return null;
        const parts = jwt.split('.');
        if (parts.length !== 3) return null;
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(b64);
        const parsed = JSON.parse(json);
        return parsed.ref || null;
    } catch (e) {
        return null;
    }
}

// 1. Detectar variables de entorno de producción (Vercel / Next.js Gravity / Vite)
const envUrl = (window.ENV?.NEXT_PUBLIC_SUPABASE_URL ||
               window.ENV?.SUPABASE_URL ||
               window.ENV?.VITE_SUPABASE_URL ||
               (typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL) : '') || '').trim();

const envKey = (window.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
               window.ENV?.SUPABASE_ANON_KEY ||
               window.ENV?.VITE_SUPABASE_ANON_KEY ||
               (typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY) : '') || '').trim();

// 2. Aplicar prioridad de configuración:
if (envUrl && !envUrl.includes("tu-proyecto")) {
    APP_CONFIG.SUPABASE_URL = normalizeSupabaseBaseUrl(envUrl);
    if (envKey && !envKey.includes("tu-anon-key")) {
        APP_CONFIG.SUPABASE_ANON_KEY = envKey.replace(/^["']|["']$/g, '');
    }
} else if (typeof localStorage !== "undefined") {
    let savedUrl = localStorage.getItem("acd_supabase_url");
    const savedKey = localStorage.getItem("acd_supabase_key");
    if (savedUrl && !savedUrl.includes("tu-proyecto") && !savedUrl.includes("bxxxtsxucohjyclcfmoj")) {
        savedUrl = normalizeSupabaseBaseUrl(savedUrl);
        localStorage.setItem("acd_supabase_url", savedUrl);
        APP_CONFIG.SUPABASE_URL = savedUrl;
    }
    if (savedKey && !savedKey.includes("tu-anon-key")) {
        APP_CONFIG.SUPABASE_ANON_KEY = savedKey.trim().replace(/^["']|["']$/g, '');
    }
}

// 3. Fallback Institucional Definitivo (Proyecto agustin-cueva en Supabase)
if (!APP_CONFIG.SUPABASE_ANON_KEY || APP_CONFIG.SUPABASE_ANON_KEY.includes("tu-anon-key")) {
    APP_CONFIG.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcmJjbXpnZ2hqd2ltdWxwZ3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzM1MDEsImV4cCI6MjEwNjkwOTUwMX0.jIZmFPNm5Pn0d26rXR-qvglFU_nGpRO83FG-1u9dyQo";
}

// 4. Auto-alineación inteligente de Entornos Cruzados:
// Si la Anon Key pertenece a un ref (ej: nkrbcmzgghjwimulpgpd) y la URL apunta a otro (ej: bxxxtsxucohjyclcfmoj)
const targetRef = extractProjectRefFromKey(APP_CONFIG.SUPABASE_ANON_KEY);
if (targetRef && (!APP_CONFIG.SUPABASE_URL || !APP_CONFIG.SUPABASE_URL.includes(targetRef))) {
    console.warn(`⚡ [Auto-Healing] Alineando URL al proyecto real de la clave API: https://${targetRef}.supabase.co`);
    APP_CONFIG.SUPABASE_URL = `https://${targetRef}.supabase.co`;
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("acd_supabase_url", APP_CONFIG.SUPABASE_URL);
    }
}

// 5. Normalizar la URL activa final
APP_CONFIG.SUPABASE_URL = normalizeSupabaseBaseUrl(APP_CONFIG.SUPABASE_URL);

console.log("⚡ [Config ACD] Supabase Target URL:", APP_CONFIG.SUPABASE_URL);
console.log("⚡ [Config ACD] Anon Key Configurada:", Boolean(APP_CONFIG.SUPABASE_ANON_KEY && !APP_CONFIG.SUPABASE_ANON_KEY.includes("tu-anon-key")));

window.APP_CONFIG = APP_CONFIG;
