/**
 * INTEGRACIÓN CON SUPABASE API (REST / POSTgREST)
 * 
 * Permite inserción de leads en la tabla 'leads' bajo HTTPS,
 * compatible con Vercel y ejecutable sin dependencias pesadas de Node.js.
 */

class SupabaseService {
    constructor(config) {
        this.config = config || window.APP_CONFIG;
    }

    /**
     * Determina la calificación del prospecto según reglas de Growth Hacking
     * @param {string} budget 
     * @returns {Object} { isQualified: boolean, tier: string }
     */
    evaluateLeadQualification(budget) {
        if (!budget) return { isQualified: true, tier: 'TIER_B' };

        if (budget.includes("Menor a $120")) {
            return { isQualified: false, tier: 'DISQUALIFIED' };
        } else if (budget.includes("Más de $350") || budget.includes("$220 - $350")) {
            return { isQualified: true, tier: 'TIER_A' };
        } else {
            return { isQualified: true, tier: 'TIER_B' };
        }
    }

    get activeConfig() {
        return this.config || window.APP_CONFIG || {};
    }

    /**
     * Construye y normaliza la URL exacta del endpoint REST de Supabase.
     * Es inmune a que el usuario pegue la URL con /rest/v1, /leads, barras finales,
     * comillas o espacios accidentales.
     * @returns {string} Endpoint normalizado (ej: https://xyz.supabase.co/rest/v1/leads)
     */
    getCleanEndpoint() {
        let rawUrl = (this.activeConfig.SUPABASE_URL || "").trim().replace(/^["']|["']$/g, '');
        if (!rawUrl) return "";

        // Si se pegó solo el ID del proyecto
        if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
            if (/^[a-z0-9-]+$/i.test(rawUrl)) {
                rawUrl = `https://${rawUrl}.supabase.co`;
            } else {
                rawUrl = `https://${rawUrl}`;
            }
        }

        let origin = "";
        try {
            const parsed = new URL(rawUrl);
            origin = parsed.origin; // Extrae únicamente "https://[id-proyecto].supabase.co"
        } catch (e) {
            origin = rawUrl.replace(/\/rest\/v1.*$/i, '').replace(/\/+$/, '');
        }

        // Auto-alineación contra la clave API si hay desajuste de proyectos
        const cleanKey = (this.activeConfig.SUPABASE_ANON_KEY || "").trim();
        if (cleanKey && cleanKey.includes(".")) {
            try {
                const parts = cleanKey.split(".");
                if (parts.length === 3) {
                    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                    const payload = JSON.parse(atob(b64));
                    if (payload.ref && !origin.includes(payload.ref)) {
                        console.warn(`⚡ [Auto-Healing Endpoint] Corrigiendo endpoint a https://${payload.ref}.supabase.co para coincidir con el proyecto de la clave.`);
                        origin = `https://${payload.ref}.supabase.co`;
                    }
                }
            } catch (e) {}
        }

        // Limpiar nombre de la tabla (elimina prefijo 'public.' o barras)
        let tableName = (this.config.TABLE_NAME || "leads").trim().replace(/^public\./i, '').replace(/^\/+|\/+$/g, '');
        if (!tableName) tableName = "leads";

        return `${origin}/rest/v1/${tableName}`;
    }

    /**
     * Retorna la fecha y hora legible en español para Ecuador (DD/MM/YYYY, HH:mm:ss)
     * @returns {string} Fecha en español (ej: "07/10/2026, 20:33:29")
     */
    getEcuadorReadableDate() {
        const d = new Date();
        const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
        const ecuadorDate = new Date(utcTime - (5 * 3600000));

        const pad = (n) => String(n).padStart(2, '0');
        const dd = pad(ecuadorDate.getDate());
        const mm = pad(ecuadorDate.getMonth() + 1);
        const yyyy = ecuadorDate.getFullYear();
        const hh = pad(ecuadorDate.getHours());
        const mi = pad(ecuadorDate.getMinutes());
        const ss = pad(ecuadorDate.getSeconds());

        return `${dd}/${mm}/${yyyy}, ${hh}:${mi}:${ss}`;
    }

    /**
     * Retorna la fecha y hora local exacta de Ecuador (UTC-5 / America/Guayaquil)
     * en formato estándar compatible con PostgreSQL: YYYY-MM-DD HH:mm:ss
     * @returns {string} Fecha y hora formateada (ej: "2026-10-07 20:25:05")
     */
    getEcuadorTimestamp() {
        const d = new Date();
        // Ecuador se mantiene fijo todo el año en UTC-5
        const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
        const ecuadorDate = new Date(utcTime - (5 * 3600000));

        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = ecuadorDate.getFullYear();
        const mm = pad(ecuadorDate.getMonth() + 1);
        const dd = pad(ecuadorDate.getDate());
        const hh = pad(ecuadorDate.getHours());
        const mi = pad(ecuadorDate.getMinutes());
        const ss = pad(ecuadorDate.getSeconds());

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    /**
     * Envía un nuevo lead a la base de datos de Supabase
     * @param {Object} formData 
     * @returns {Promise<Object>}
     */
    async insertLead(formData) {
        const { isQualified, tier } = this.evaluateLeadQualification(formData.estimated_budget);
        const readableDate = this.getEcuadorReadableDate();

        const payload = {
            created_at: this.getEcuadorTimestamp(),
            fecha: readableDate,
            full_name: formData.full_name?.trim(),
            email: formData.email?.trim().toLowerCase(),
            whatsapp: formData.whatsapp?.trim(),
            company: formData.company?.trim(),
            estimated_budget: formData.estimated_budget,
            primary_pain: formData.primary_pain,
            is_qualified: isQualified,
            qualification_tier: tier,
            lead_status: 'nuevo',
            source: 'landing_mofu_acd_vibe',
            notes: formData.notes ? `${formData.notes} | Fecha: ${readableDate}` : `Registrado el ${readableDate}`,
            user_agent: navigator.userAgent
        };

        const rawUrl = (this.activeConfig.SUPABASE_URL || "").trim();
        const rawKey = (this.activeConfig.SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, '');

        const isConfigured = 
            rawUrl && 
            !rawUrl.includes("tu-proyecto") &&
            rawKey && 
            !rawKey.includes("tu-anon-key");

        // Modo Demostración Local (cuando aún no se han pegado las llaves reales)
        if (!isConfigured) {
            console.warn("⚠️ Supabase no configurado con llaves reales. Guardando en modo Simulación Local.");
            
            // Almacenar en localStorage para no perder el registro durante la prueba
            const localLeads = JSON.parse(localStorage.getItem("acd_demo_leads") || "[]");
            const demoRecord = {
                id: "demo-" + Date.now(),
                created_at: new Date().toISOString(),
                ...payload
            };
            localLeads.push(demoRecord);
            localStorage.setItem("acd_demo_leads", JSON.stringify(localLeads));

            // Simular latencia de red
            await new Promise(resolve => setTimeout(resolve, 800));

            return {
                success: true,
                isDemo: true,
                data: demoRecord,
                message: "Lead registrado exitosamente en modo demostración local."
            };
        }

        // Endpoint REST sanitizado y garantizado (PostgREST)
        const endpoint = this.getCleanEndpoint();

        console.log("📡 [Supabase Request] Endpoint limpio y normalizado:", endpoint);
        console.log("📦 [Supabase Payload]:", payload);

        try {
            let response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": rawKey,
                    "Authorization": `Bearer ${rawKey}`,
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(payload)
            });

            // Resiliencia inteligente: Si la columna 'fecha' aún no existe en Supabase, reintentar sin ella
            if (!response.ok && payload.fecha) {
                const errClone = await response.clone().json().catch(() => ({}));
                if (errClone.message?.includes("'fecha'") || errClone.code === "PGRST204") {
                    console.warn("⚠️ Columna 'fecha' pendiente en Supabase. Reintentando guardado seguro sin 'fecha'...");
                    delete payload.fecha;
                    response = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "apikey": rawKey,
                            "Authorization": `Bearer ${rawKey}`,
                            "Prefer": "return=minimal"
                        },
                        body: JSON.stringify(payload)
                    });
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                // Logging exhaustivo en consola para depuración
                console.error("❌ [Supabase Error Detallado]:", {
                    httpStatus: response.status,
                    statusText: response.statusText,
                    code: errorData.code,
                    message: errorData.message,
                    details: errorData.details,
                    hint: errorData.hint,
                    endpoint: endpoint,
                    table: this.config.TABLE_NAME
                });

                if (errorData.message?.includes("Invalid path specified") || errorData.code === "PGRST125") {
                    console.warn(
                        "⚠️ DIAGNÓSTICO PGRST125: La URL solicitada no es válida para PostgREST.\n" +
                        "Asegúrate de que la URL de Supabase sea únicamente https://[id-proyecto].supabase.co (sin /rest/v1 ni /leads al final)."
                    );
                }

                if (errorData.message?.includes("Could not find the table") || errorData.code === "PGRST205") {
                    console.warn(
                        "⚠️ DIAGNÓSTICO PGRST205: La tabla 'public.leads' no fue encontrada en la base de datos de Supabase.\n" +
                        "Solución: Ve a Supabase -> SQL Editor, ejecuta el archivo schema.sql y recarga el esquema ejecutando: NOTIFY pgrst, 'reload schema';"
                    );
                }

                const customMsg = errorData.message ? `${errorData.message} (Código: ${errorData.code || response.status})` : `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(customMsg);
            }

            console.log("✅ [Supabase Success] Lead insertado exitosamente con HTTP", response.status);

            let data = payload;
            const textResponse = await response.text().catch(() => "");
            if (textResponse) {
                try { data = JSON.parse(textResponse); } catch(e) {}
            }

            return {
                success: true,
                isDemo: false,
                data: Array.isArray(data) ? data[0] : data,
                message: "Lead sincronizado y almacenado en Supabase con éxito."
            };
        } catch (error) {
            console.error("❌ [Supabase Error Catch]:", error);
            throw error;
        }
    }
}

window.supabaseService = new SupabaseService();
