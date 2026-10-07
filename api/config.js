// api/config.js - Vercel Serverless Function
// Endpoint REST para verificar variables de entorno públicas y estado de conexión

module.exports = (req, res) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(200).json({
        status: "ok",
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseAnonKey),
        projectUrl: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, "$1...") : null,
        configured: Boolean(supabaseUrl && supabaseAnonKey)
    });
};
