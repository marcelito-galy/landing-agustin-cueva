/**
 * CONFIGURACIÓN CENTRALIZADA - UNIDAD EDUCATIVA AGUSTÍN CUEVA DÁVILA
 * 
 * En producción (Vercel), estos valores se pueden inyectar mediante variables
 * de entorno o dejarlos configurados aquí con tus credenciales de Supabase.
 */

const APP_CONFIG = {
    // URL de tu proyecto Supabase (ej: "https://xyzcompany.supabase.co")
    SUPABASE_URL: window.ENV?.SUPABASE_URL || "https://tu-proyecto.supabase.co",

    // Clave anónima pública (anon key) de Supabase
    SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || "tu-anon-key-aqui",

    // Nombre de la tabla en Supabase
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

// Permitir sobreescribir desde localStorage para pruebas interactivas en vivo
if (typeof localStorage !== "undefined") {
    const savedUrl = localStorage.getItem("acd_supabase_url");
    const savedKey = localStorage.getItem("acd_supabase_key");
    if (savedUrl) APP_CONFIG.SUPABASE_URL = savedUrl;
    if (savedKey) APP_CONFIG.SUPABASE_ANON_KEY = savedKey;
}

window.APP_CONFIG = APP_CONFIG;
