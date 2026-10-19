/**
 * INTEGRACIÓN CON SUPABASE API (REST / POSTgREST) & MOTOR BOFU DE LEAD SCORING
 * UNIDAD EDUCATIVA "AGUSTÍN CUEVA DÁVILA" - IBARRA, ECUADOR
 * 
 * Incluye:
 * 1. Inserción resiliente de leads desde la Landing Page (MOFU)
 * 2. Motor Automático de Lead Scoring (0-100 pts) y Clasificación BOFU
 * 3. Lectura, filtrado y actualización en tiempo real de estados para /admin
 * 4. Generador de enlaces de Cierre por WhatsApp Inteligente en 1 Clic
 */

class SupabaseService {
    constructor(config) {
        this.config = config || window.APP_CONFIG;
    }

    /**
     * Determina la calificación preliminar del prospecto (MOFU)
     * @param {string} budget 
     * @returns {Object} { isQualified: boolean, tier: string }
     */
    evaluateLeadQualification(budget) {
        if (!budget) return { isQualified: true, tier: 'TIER_B' };

        if (budget.includes("Menor a $120")) {
            return { isQualified: false, tier: 'DISQUALIFIED' };
        } else if (budget.includes("Más de $350") || budget.includes("$220 - $350") || budget.includes("10D01")) {
            return { isQualified: true, tier: 'TIER_A' };
        } else {
            return { isQualified: true, tier: 'TIER_B' };
        }
    }

    /**
     * MOTOR DE LEAD SCORING AUTOMÁTICO (FASE 3 - BOFU)
     * Calcula el puntaje de 0 a 100 puntos según las 3 reglas de negocio oficiales:
     *  1. Presupuesto Estimado / Rango (Hasta 50 pts: Alto +50, Medio +30, Bajo +10)
     *  2. Dolor Principal / Obstáculo (Hasta 35 pts: Seguridad/Infraestructura/Calidad +35, Trato/Acompañamiento +25, Otros +15)
     *  3. Perfil / Datos Completos (Hasta 15 pts: Nombre + WhatsApp válido + Empresa/Ocupación +15)
     * 
     * @param {Object} lead - Objeto del prospecto (nuevo o existente en Supabase)
     * @returns {Object} { score, categoria_lead, estado, breakdown, painCategory, levelInterest }
     */
    calculateLeadScore(lead = {}) {
        const rawBudget = String(lead.estimated_budget || "").toLowerCase();
        const rawNotes = String(lead.notes || "").toLowerCase();
        const rawPain = String(lead.primary_pain || "").toLowerCase();
        const fullName = String(lead.full_name || "").trim();
        const whatsapp = String(lead.whatsapp || "").trim();
        const company = String(lead.company || lead.occupation || "").trim();
        const email = String(lead.email || "").trim();

        // ======================================================================
        // 1. PUNTOS POR PRESUPUESTO ESTIMADO / RANGO (HASTA 50 PTS)
        // ======================================================================
        let budgetPoints = 10;
        let budgetLabel = "Rango Básico (+10 pts)";

        const isHighBudget =
            rawBudget.includes("350") ||
            rawBudget.includes("220") ||
            rawBudget.includes("alto") ||
            rawBudget.includes("completo") ||
            rawBudget.includes("premium") ||
            rawBudget.includes("avanzado") ||
            rawBudget.includes("10d01") ||
            rawBudget.includes("urbano") ||
            rawBudget.includes("centro") ||
            rawNotes.includes("lo antes posible") ||
            rawNotes.includes("este mes") ||
            rawNotes.includes("80/100") ||
            rawNotes.includes("90/100") ||
            rawNotes.includes("100/100");

        const isMediumBudget =
            !isHighBudget && (
                rawBudget.includes("120 - $220") ||
                rawBudget.includes("120") ||
                rawBudget.includes("medio") ||
                rawBudget.includes("estándar") ||
                rawBudget.includes("estandar") ||
                rawBudget.includes("periferia") ||
                rawBudget.includes("rural") ||
                rawNotes.includes("próximo año") ||
                rawNotes.includes("proximo año") ||
                rawNotes.includes("60/100")
            );

        if (isHighBudget) {
            budgetPoints = 50;
            budgetLabel = "Rango Alto / Completo (+50 pts)";
        } else if (isMediumBudget) {
            budgetPoints = 30;
            budgetLabel = "Rango Medio / Estándar (+30 pts)";
        } else {
            budgetPoints = 10;
            budgetLabel = "Rango Bajo / Básico (+10 pts)";
        }

        // ======================================================================
        // 2. PUNTOS POR DOLOR PRINCIPAL / OBSTÁCULO DETECTADO (HASTA 35 PTS)
        // ======================================================================
        let painPoints = 15;
        let painCategory = "Otros / Consulta General";
        let painLabel = "Consulta General (+15 pts)";

        const securityKeywords = [
            "segur", "robo", "hurto", "perdida", "pérdida", "casillero", "mochila",
            "bullying", "acoso", "violencia", "peligro", "control", "vigilancia",
            "ingreso", "salida", "receso", "entorno", "paz", "tranquilidad", "cuidado", "prote"
        ];

        const infraQualityKeywords = [
            "infraestructura", "instalacion", "baño", "bano", "higien", "limpie",
            "sucio", "deterior", "abandon", "espacio", "aula", "laboratorio",
            "cancha", "bar", "comedor", "calidad", "académic", "academic",
            "ciencias", "técnic", "tecnic", "nivel", "enseñanza", "aprendizaje",
            "universidad", "malla", "inglés", "ingles", "prestigio", "talleres"
        ];

        const fairTreatmentKeywords = [
            "trato", "justo", "justicia", "acompañamiento", "acompanamiento",
            "dece", "psicol", "orientaci", "empat", "comunicaci", "docente",
            "profesor", "maestro", "atenci", "discrimin", "exclusi", "favoritismo",
            "preferencia", "igual", "emocional", "valores", "respeto", "humano"
        ];

        const matchesSecurity = securityKeywords.some(k => rawPain.includes(k));
        const matchesInfraQuality = infraQualityKeywords.some(k => rawPain.includes(k));
        const matchesFairTreatment = fairTreatmentKeywords.some(k => rawPain.includes(k));

        if (matchesSecurity) {
            painPoints = 35;
            painCategory = "Seguridad / Entorno";
            painLabel = "Urgencia Crítica: Seguridad / Entorno (+35 pts)";
        } else if (matchesInfraQuality) {
            painPoints = 35;
            painCategory = "Infraestructura / Calidad Académica";
            painLabel = "Urgencia Crítica: Infraestructura / Calidad (+35 pts)";
        } else if (matchesFairTreatment) {
            painPoints = 25;
            painCategory = "Trato Justo / Acompañamiento";
            painLabel = "Trato Justo / Acompañamiento (+25 pts)";
        } else if (rawNotes.includes("nivel académico") || rawNotes.includes("instalaciones")) {
            painPoints = 35;
            painCategory = "Infraestructura / Calidad Académica";
            painLabel = "Urgencia Crítica: Calidad / Instalaciones (+35 pts)";
        } else if (rawNotes.includes("dece") || rawNotes.includes("psicológico")) {
            painPoints = 25;
            painCategory = "Trato Justo / Acompañamiento";
            painLabel = "Trato Justo / Acompañamiento (+25 pts)";
        } else {
            painPoints = 15;
            painCategory = "Otros / Consulta General";
            painLabel = "Otros / Consulta General (+15 pts)";
        }

        // ======================================================================
        // 3. PUNTOS POR PERFIL / DATOS COMPLETOS (HASTA 15 PTS)
        // ======================================================================
        const cleanDigits = whatsapp.replace(/\D/g, "");
        const hasValidWhatsapp = cleanDigits.length >= 7;
        const hasFullName = fullName.length >= 3;
        const hasCompany = company.length >= 2;
        const hasEmail = email.includes("@") || email.length >= 5;

        let profilePoints = 0;
        let profileLabel = "Perfil Incompleto (+0 pts)";

        if (hasFullName && hasValidWhatsapp && hasCompany) {
            profilePoints = 15;
            profileLabel = "Perfil Completo: WhatsApp + Ocupación (+15 pts)";
        } else if (hasFullName && (hasValidWhatsapp || hasEmail)) {
            profilePoints = 8;
            profileLabel = "Perfil Parcial (+8 pts)";
        } else {
            profilePoints = 5;
            profileLabel = "Datos Básicos (+5 pts)";
        }

        // ======================================================================
        // 4. CÁLCULO TOTAL Y CLASIFICACIÓN AUTOMÁTICA BOFU
        // ======================================================================
        const computedScore = Math.min(100, Math.max(0, budgetPoints + painPoints + profilePoints));

        // Si el registro en BD ya tiene un score explícito válido (>0), lo respetamos o usamos el calculado
        const finalScore = (typeof lead.score === "number" && lead.score > 0)
            ? lead.score
            : computedScore;

        let categoriaLead = "❄️ Prioridad Baja";
        let tierBadge = "Cold Lead - Nutrición";

        if (finalScore >= 75) {
            categoriaLead = "🔥 Prioridad Alta";
            tierBadge = "Hot Lead - Cierre Inmediato";
        } else if (finalScore >= 45) {
            categoriaLead = "⚡ Prioridad Media";
            tierBadge = "Warm Lead - Seguimiento";
        } else {
            categoriaLead = "❄️ Prioridad Baja";
            tierBadge = "Cold Lead - Nutrición";
        }

        // Normalizar Estado BOFU
        const validStates = ["Nuevo", "Contactado", "Visita Agendada", "Matriculado", "Descartado"];
        let rawEstado = String(lead.estado || lead.lead_status || "Nuevo").trim();
        const matchedState = validStates.find(s => s.toLowerCase() === rawEstado.toLowerCase());
        const finalEstado = matchedState || "Nuevo";

        // Extraer Nivel de interés desde las notas si existe
        let levelInterest = "Admisión General";
        const levelMatch = String(lead.notes || "").match(/Nivel:\s*([^|]+)/i);
        if (levelMatch && levelMatch[1]) {
            levelInterest = levelMatch[1].trim();
        }

        return {
            score: finalScore,
            computedScore,
            categoria_lead: categoriaLead,
            tierBadge,
            estado: finalEstado,
            painCategory,
            levelInterest,
            breakdown: {
                budgetPoints,
                budgetLabel,
                painPoints,
                painLabel,
                profilePoints,
                profileLabel
            }
        };
    }

    /**
     * Normaliza un número telefónico de Ecuador para enlaces https://wa.me/
     * @param {string} rawPhone 
     * @returns {string} Número en formato internacional (ej: 593991234567)
     */
    formatWhatsAppNumber(rawPhone) {
        let digits = String(rawPhone || "").replace(/\D/g, "");
        if (!digits) {
            return this.activeConfig.WHATSAPP_NUMBER || "593959920177";
        }
        if (digits.startsWith("00593")) {
            digits = digits.slice(2);
        } else if (digits.startsWith("593") && digits.length >= 11) {
            // Ya tiene código de país 593
            if (digits.startsWith("5930")) {
                digits = "593" + digits.slice(4);
            }
        } else if (digits.startsWith("0") && digits.length >= 9) {
            digits = "593" + digits.slice(1);
        } else if (digits.length === 9 && digits.startsWith("9")) {
            digits = "593" + digits;
        }
        return digits;
    }

    /**
     * Genera el mensaje dinámico BOFU y la URL de WhatsApp en 1 clic
     * respondiendo directamente al dolor principal del padre de familia.
     * @param {Object} lead 
     * @returns {Object} { url: string, message: string, phone: string }
     */
    buildSmartWhatsAppClosing(lead = {}) {
        const scoring = this.calculateLeadScore(lead);
        const parentName = (lead.full_name || "Estimado representante").trim();
        const painText = (lead.primary_pain || "brindar una educación segura y de excelencia").trim();
        const levelText = scoring.levelInterest !== "Admisión General" ? ` para *${scoring.levelInterest}*` : "";
        const cleanPhone = this.formatWhatsAppNumber(lead.whatsapp);

        let empatheticResponse = "";
        if (scoring.painCategory === "Seguridad / Entorno") {
            empatheticResponse =
                `Comprendemos totalmente su preocupación respecto a *"${painText}"*. En la Unidad Educativa "Agustín Cueva Dávila" garantizamos paz mental a nuestras familias mediante control perimetral permanente, vigilancia docente activa en cada receso y protocolos estrictos de seguridad interna.`;
        } else if (scoring.painCategory === "Infraestructura / Calidad Académica") {
            empatheticResponse =
                `Tomamos muy en serio lo que nos comenta sobre *"${painText}"*. En la Unidad Educativa "Agustín Cueva Dávila" contamos con aulas equipadas, baños con higiene permanente, laboratorios, canchas sintéticas y excelencia académica tanto en Bachillerato en Ciencias como en Técnico.`;
        } else if (scoring.painCategory === "Trato Justo / Acompañamiento") {
            empatheticResponse =
                `Valoramos mucho lo que nos comparte respecto a *"${painText}"*. En la Unidad Educativa "Agustín Cueva Dávila" cada estudiante importa igual: brindamos trato humano, comunicación directa con los docentes y acompañamiento continuo de nuestro departamento DECE sin distinciones.`;
        } else {
            empatheticResponse =
                `Hemos revisado con atención su comentario sobre *"${painText}"* y queremos mostrarle personalmente cómo en la Unidad Educativa "Agustín Cueva Dávila" ofrecemos un entorno seguro, trato justo y aprendizaje en espacios dignos.`;
        }

        const message =
            `Hola *${parentName}*, le saludamos del Equipo de Admisiones de la *Unidad Educativa "Agustín Cueva Dávila"* en Ibarra. 🎓\n\n` +
            `Recibimos su postulación prioritaria${levelText}.\n\n` +
            `${empatheticResponse}\n\n` +
            `Por su perfil prioritario, hemos habilitado un turno preferencial para que recorra nuestras instalaciones en una *Visita Guiada de Puertas Abiertas*. ¿Le quedaría bien visitarnos mañana o prefiere agendar para esta semana?`;

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        return { url, message, phone: cleanPhone };
    }

    get activeConfig() {
        return this.config || window.APP_CONFIG || {};
    }

    /**
     * Construye y normaliza la URL exacta del endpoint REST de Supabase.
     * @returns {string} Endpoint normalizado (ej: https://xyz.supabase.co/rest/v1/leads)
     */
    getCleanEndpoint() {
        let rawUrl = (this.activeConfig.SUPABASE_URL || "").trim().replace(/^["']|["']$/g, '');
        if (!rawUrl) return "";

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
            origin = parsed.origin;
        } catch (e) {
            origin = rawUrl.replace(/\/rest\/v1.*$/i, '').replace(/\/+$/, '');
        }

        const cleanKey = (this.activeConfig.SUPABASE_ANON_KEY || "").trim();
        if (cleanKey && cleanKey.includes(".")) {
            try {
                const parts = cleanKey.split(".");
                if (parts.length === 3) {
                    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                    const payload = JSON.parse(atob(b64));
                    if (payload.ref && !origin.includes(payload.ref)) {
                        origin = `https://${payload.ref}.supabase.co`;
                    }
                }
            } catch (e) {}
        }

        let tableName = (this.config.TABLE_NAME || "leads").trim().replace(/^public\./i, '').replace(/^\/+|\/+$/g, '');
        if (!tableName) tableName = "leads";

        return `${origin}/rest/v1/${tableName}`;
    }

    /**
     * Retorna la fecha y hora legible en español para Ecuador (DD/MM/YYYY, HH:mm:ss)
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
     * Retorna la fecha y hora local exacta de Ecuador (UTC-5) en formato PostgreSQL
     */
    getEcuadorTimestamp() {
        const d = new Date();
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
     * Envía un nuevo lead a la base de datos de Supabase calculando automáticamente
     * el Score BOFU (0-100), categoria_lead y estado = 'Nuevo'.
     * @param {Object} formData 
     * @returns {Promise<Object>}
     */
    async insertLead(formData) {
        const { isQualified, tier } = this.evaluateLeadQualification(formData.estimated_budget);
        const readableDate = this.getEcuadorReadableDate();

        // Ejecutar Motor de Lead Scoring Automático (Fase 3 BOFU)
        const scoringResult = this.calculateLeadScore(formData);

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
            score: scoringResult.score,
            categoria_lead: scoringResult.categoria_lead,
            estado: 'Nuevo',
            source: 'landing_mofu_acd_vibe',
            notes: formData.notes
                ? `${formData.notes} | Score BOFU: ${scoringResult.score}/100 (${scoringResult.categoria_lead}) | Fecha: ${readableDate}`
                : `Score BOFU: ${scoringResult.score}/100 (${scoringResult.categoria_lead}) | Registrado el ${readableDate}`,
            user_agent: navigator.userAgent
        };

        const rawUrl = (this.activeConfig.SUPABASE_URL || "").trim();
        const rawKey = (this.activeConfig.SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, '');

        const isConfigured = 
            rawUrl && 
            !rawUrl.includes("tu-proyecto") &&
            rawKey && 
            !rawKey.includes("tu-anon-key");

        // Guardar respaldo local siempre para disponibilidad inmediata en /admin
        try {
            const localLeads = JSON.parse(localStorage.getItem("acd_demo_leads") || "[]");
            const localCopy = {
                id: "local-" + Date.now(),
                ...payload
            };
            localLeads.unshift(localCopy);
            localStorage.setItem("acd_demo_leads", JSON.stringify(localLeads.slice(0, 100)));
        } catch (e) {}

        if (!isConfigured) {
            console.warn("⚠️ Supabase no configurado con llaves reales. Guardando en modo Simulación Local.");
            await new Promise(resolve => setTimeout(resolve, 600));
            return {
                success: true,
                isDemo: true,
                data: payload,
                scoring: scoringResult,
                message: "Lead registrado exitosamente en modo demostración local."
            };
        }

        const endpoint = this.getCleanEndpoint();
        const postHeaders = {
            "Content-Type": "application/json",
            "apikey": rawKey,
            "Authorization": `Bearer ${rawKey}`,
            "Prefer": "return=minimal"
        };

        try {
            let currentPayload = { ...payload };
            let response = await fetch(endpoint, {
                method: "POST",
                headers: postHeaders,
                body: JSON.stringify(currentPayload)
            });

            // Resiliencia automática si alguna columna opcional aún no ha sido creada en Supabase
            const optionalColumns = ["fecha", "score", "categoria_lead", "estado"];
            for (const col of optionalColumns) {
                if (!response.ok) {
                    const errClone = await response.clone().json().catch(() => ({}));
                    const errMsg = String(errClone.message || "");
                    if (errMsg.includes(`'${col}'`) || errClone.code === "PGRST204") {
                        console.warn(`⚠️ Columna '${col}' pendiente en Supabase. Reintentando guardado seguro...`);
                        delete currentPayload[col];
                        // Si es PGRST204 y menciona específicamente otra columna opcional, eliminarla también
                        optionalColumns.forEach(c => {
                            if (errMsg.includes(`'${c}'`)) delete currentPayload[c];
                        });
                        response = await fetch(endpoint, {
                            method: "POST",
                            headers: postHeaders,
                            body: JSON.stringify(currentPayload)
                        });
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ [Supabase Error Detallado]:", errorData);
                const customMsg = errorData.message
                    ? `${errorData.message} (Código: ${errorData.code || response.status})`
                    : `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(customMsg);
            }

            console.log("✅ [Supabase Success] Lead insertado con Score BOFU:", scoringResult.score, scoringResult.categoria_lead);

            return {
                success: true,
                isDemo: false,
                data: payload,
                scoring: scoringResult,
                message: "Lead sincronizado y almacenado en Supabase con éxito."
            };
        } catch (error) {
            console.error("❌ [Supabase Error Catch]:", error);
            throw error;
        }
    }

    /**
     * Obtiene todos los prospectos desde Supabase para la Bandeja BOFU (/admin),
     * ejecuta el motor de Lead Scoring para cada registro y los ordena de mayor a menor Score.
     * @returns {Promise<Object>} { leads: Array, source: string, rlsWarning: boolean }
     */
    async fetchLeads() {
        const endpoint = this.getCleanEndpoint();
        const rawKey = (this.activeConfig.SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, '');

        let remoteLeads = [];
        let rlsWarning = false;
        let errorMessage = null;

        if (endpoint && rawKey) {
            try {
                const url = `${endpoint}?select=*&order=created_at.desc`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": rawKey,
                        "Authorization": `Bearer ${rawKey}`
                    }
                });

                if (response.ok) {
                    remoteLeads = await response.json();
                } else {
                    const errData = await response.json().catch(() => ({}));
                    errorMessage = errData.message || `HTTP ${response.status}`;
                    console.warn("⚠️ Error al consultar leads en Supabase:", errorMessage);
                }
            } catch (err) {
                errorMessage = err.message;
                console.warn("⚠️ Excepción al conectar con Supabase:", err);
            }
        }

        // Enriquecer cada lead con el Motor de Lead Scoring Automático
        const enrichedLeads = remoteLeads.map(lead => {
            const scoring = this.calculateLeadScore(lead);
            const wa = this.buildSmartWhatsAppClosing({ ...lead, ...scoring });
            return {
                ...lead,
                score: scoring.score,
                computedScore: scoring.computedScore,
                categoria_lead: lead.categoria_lead && lead.categoria_lead.includes("Prioridad")
                    ? lead.categoria_lead
                    : scoring.categoria_lead,
                estado: scoring.estado,
                painCategory: scoring.painCategory,
                levelInterest: scoring.levelInterest,
                breakdown: scoring.breakdown,
                whatsappUrl: wa.url,
                whatsappMessage: wa.message,
                cleanPhone: wa.phone
            };
        });

        // Ordenar automáticamente de MAYOR a MENOR Score (y por fecha en caso de empate)
        enrichedLeads.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });

        return {
            leads: enrichedLeads,
            count: enrichedLeads.length,
            error: errorMessage,
            rlsWarning: enrichedLeads.length === 0 && !errorMessage
        };
    }

    /**
     * Actualiza en tiempo real el estado, score y categoría de un prospecto en Supabase
     * @param {string|number} leadId 
     * @param {Object} updates - { estado, score, categoria_lead }
     * @returns {Promise<Object>}
     */
    async updateLead(leadId, updates = {}) {
        const endpoint = this.getCleanEndpoint();
        const rawKey = (this.activeConfig.SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, '');

        const payload = { ...updates };
        if (updates.estado) {
            payload.lead_status = updates.estado.toLowerCase();
        }

        // Si es un lead local o de demostración
        if (String(leadId).startsWith("local-") || String(leadId).startsWith("demo-")) {
            try {
                const localLeads = JSON.parse(localStorage.getItem("acd_demo_leads") || "[]");
                const idx = localLeads.findIndex(l => String(l.id) === String(leadId));
                if (idx !== -1) {
                    localLeads[idx] = { ...localLeads[idx], ...payload };
                    localStorage.setItem("acd_demo_leads", JSON.stringify(localLeads));
                }
            } catch (e) {}
            return { success: true, isLocal: true };
        }

        const url = `${endpoint}?id=eq.${encodeURIComponent(leadId)}`;
        const headers = {
            "Content-Type": "application/json",
            "apikey": rawKey,
            "Authorization": `Bearer ${rawKey}`,
            "Prefer": "return=representation"
        };

        let response = await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify(payload)
        });

        // Resiliencia por si la columna 'estado', 'score' o 'categoria_lead' aún no fue creada con el SQL
        if (!response.ok) {
            const errClone = await response.clone().json().catch(() => ({}));
            const errMsg = String(errClone.message || "");
            if (errMsg.includes("'estado'") || errMsg.includes("'score'") || errMsg.includes("'categoria_lead'") || errClone.code === "PGRST204") {
                const fallbackPayload = { lead_status: (updates.estado || "Nuevo").toLowerCase() };
                response = await fetch(url, {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(fallbackPayload)
                });
            }
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Error HTTP ${response.status} al actualizar en Supabase`);
        }

        const updatedRows = await response.json().catch(() => []);
        return {
            success: true,
            data: updatedRows[0] || payload
        };
    }

    /**
     * Sincroniza en segundo plano los puntajes (score, categoria_lead, estado)
     * de los leads existentes en Supabase que aún tengan score = 0 o nulo.
     * @param {Array} leads 
     */
    async syncExistingLeadsScores(leads = []) {
        const needsSync = leads.filter(l =>
            l.id &&
            !String(l.id).startsWith("local-") &&
            !String(l.id).startsWith("demo-")
        );

        let syncedCount = 0;
        for (const lead of needsSync) {
            try {
                const scoring = this.calculateLeadScore(lead);
                await this.updateLead(lead.id, {
                    score: scoring.computedScore,
                    categoria_lead: scoring.categoria_lead,
                    estado: scoring.estado
                });
                syncedCount++;
            } catch (e) {
                console.warn(`No se pudo sincronizar score para lead ${lead.id}:`, e.message);
            }
        }
        return syncedCount;
    }
}

window.supabaseService = new SupabaseService();
window.calculateLeadScore = (lead) => window.supabaseService.calculateLeadScore(lead);
