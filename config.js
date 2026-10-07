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
                  "https://tu-proyecto.supabase.co",

    // Clave anónima pública (anon key) de Supabase
    SUPABASE_ANON_KEY: window.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                      window.ENV?.SUPABASE_ANON_KEY ||
                      window.ENV?.VITE_SUPABASE_ANON_KEY ||
                      (typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY) : '') ||
                      "tu-anon-key-aqui",

    // Nombre exacto de la tabla en Supabase (public.leads)
    TABLE_NAME: "leads",

    // WhatsApp institucional de admisiones para cierre rápido
    WHATSAPP_NUMBER: "593998765432", // Formato internacional Ecuador

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
// Si existen variables de Vercel/Producción válidas, tienen PRIORIDAD ABSOLUTA
if (envUrl && !envUrl.includes("tu-proyecto")) {
    APP_CONFIG.SUPABASE_URL = normalizeSupabaseBaseUrl(envUrl);
    if (envKey && !envKey.includes("tu-anon-key")) {
        APP_CONFIG.SUPABASE_ANON_KEY = envKey.replace(/^["']|["']$/g, '');
    }
} else if (typeof localStorage !== "undefined") {
    // Si no hay variables de entorno en producción, permitir pruebas con localStorage
    let savedUrl = localStorage.getItem("acd_supabase_url");
    const savedKey = localStorage.getItem("acd_supabase_key");
    if (savedUrl && !savedUrl.includes("tu-proyecto")) {
        savedUrl = normalizeSupabaseBaseUrl(savedUrl);
        localStorage.setItem("acd_supabase_url", savedUrl);
        APP_CONFIG.SUPABASE_URL = savedUrl;
    }
    if (savedKey && !savedKey.includes("tu-anon-key")) {
        APP_CONFIG.SUPABASE_ANON_KEY = savedKey.trim().replace(/^["']|["']$/g, '');
    }
}

// 3. Normalizar la URL activa final
APP_CONFIG.SUPABASE_URL = normalizeSupabaseBaseUrl(APP_CONFIG.SUPABASE_URL);

console.log("⚡ [Config ACD] Supabase Target URL:", APP_CONFIG.SUPABASE_URL);
console.log("⚡ [Config ACD] Anon Key Configurada:", Boolean(APP_CONFIG.SUPABASE_ANON_KEY && !APP_CONFIG.SUPABASE_ANON_KEY.includes("tu-anon-key")));

window.APP_CONFIG = APP_CONFIG;
