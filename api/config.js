// api/config.js - Vercel Serverless Function
// Endpoint REST para verificar variables de entorno públicas y estado de conexión

module.exports = (req, res) => {
    let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

    let projectRef = null;
    try {
        if (supabaseAnonKey && supabaseAnonKey.includes(".")) {
            const parts = supabaseAnonKey.split(".");
            if (parts.length === 3) {
                const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
                projectRef = payload.ref || null;
                if (projectRef && (!supabaseUrl || !supabaseUrl.includes(projectRef))) {
                    supabaseUrl = `https://${projectRef}.supabase.co`;
                }
            }
        }
    } catch (e) {}

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(200).json({
        status: "ok",
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseAnonKey),
        projectRef: projectRef,
        projectUrl: supabaseUrl,
        configured: Boolean(supabaseUrl && supabaseAnonKey)
    });
};
