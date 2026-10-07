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

        const isConfigured = 
            this.config.SUPABASE_URL && 
            !this.config.SUPABASE_URL.includes("tu-proyecto") &&
            this.config.SUPABASE_ANON_KEY && 
            !this.config.SUPABASE_ANON_KEY.includes("tu-anon-key");

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

        // Petición real a la API REST de Supabase (PostgREST)
        const endpoint = `${this.config.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${this.config.TABLE_NAME}`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": this.config.SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${this.config.SUPABASE_ANON_KEY}`,
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error en Supabase HTTP ${response.status}: ${response.statusText}`);
            }

            // Con return=minimal y sin políticas de SELECT para anon, el registro se almacena exitosamente
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
            console.error("❌ Error al insertar lead en Supabase:", error);
            throw error;
        }
    }
}

window.supabaseService = new SupabaseService();
