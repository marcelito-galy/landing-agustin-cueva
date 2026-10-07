// api/env.js - Vercel Serverless Function
// Inyecta dinámicamente las variables de entorno de Vercel (NEXT_PUBLIC_SUPABASE_*)
// directamente en el navegador del usuario al cargar la página.
// Incluye Auto-Alineación de Project Reference para evitar errores por entornos cruzados.

module.exports = (req, res) => {
    let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

    // Auto-detección y alineación de Project Ref desde el token JWT de la Anon Key
    try {
        if (supabaseAnonKey && supabaseAnonKey.includes(".")) {
            const parts = supabaseAnonKey.split(".");
            if (parts.length === 3) {
                const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
                if (payload.ref) {
                    const expectedUrl = `https://${payload.ref}.supabase.co`;
                    // Si la URL en Vercel apunta a un proyecto desalineado, auto-corregir hacia el ref de la clave
                    if (!supabaseUrl || !supabaseUrl.includes(payload.ref)) {
                        supabaseUrl = expectedUrl;
                    }
                }
            }
        }
    } catch (e) {}

    // Fallback institucional si no hay variables en Vercel
    if (!supabaseUrl) {
        supabaseUrl = "https://nkrbcmzgghjwimulpgpd.supabase.co";
    }

    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(200).send(`window.ENV = Object.assign(window.ENV || {}, {
  NEXT_PUBLIC_SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)}
});`);
};
