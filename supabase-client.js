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

        // Limpiar nombre de la tabla (elimina prefijo 'public.' o barras)
        let tableName = (this.config.TABLE_NAME || "leads").trim().replace(/^public\./i, '').replace(/^\/+|\/+$/g, '');
        if (!tableName) tableName = "leads";

        return `${origin}/rest/v1/${tableName}`;
    }

    /**
     * Envía un nuevo lead a la base de datos de Supabase
     * @param {Object} formData 
     * @returns {Promise<Object>}
     */
    async insertLead(formData) {
        const { isQualified, tier } = this.evaluateLeadQualification(formData.estimated_budget);

        const payload = {
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
            notes: formData.notes || null,
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
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": rawKey,
                    "Authorization": `Bearer ${rawKey}`,
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(payload)
            });

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
