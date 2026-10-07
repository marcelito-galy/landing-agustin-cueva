// api/env.js - Vercel Serverless Function
// Inyecta dinámicamente las variables de entorno de Vercel (NEXT_PUBLIC_SUPABASE_*)
// directamente en el navegador del usuario al cargar la página.

module.exports = (req, res) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(200).send(`window.ENV = Object.assign(window.ENV || {}, {
  NEXT_PUBLIC_SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)}
});`);
};
