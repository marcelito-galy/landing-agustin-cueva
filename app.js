/**
 * CONTROLADOR PRINCIPAL DE LA LANDING PAGE
 * UNIDAD EDUCATIVA AGUSTÍN CUEVA DÁVILA
 * Metodología: Vibe Coding (Fast, Interactive, Growth Focused)
 */

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initQualificationForm();
    initBudgetBadgeFeedback();
    initSettingsModal();
    initSmoothScroll();
    initFAQ();
});

// 1. Navegación móvil y efectos de scroll
function initNavigation() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });

        // Cerrar menú al hacer clic en enlaces móviles
        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => mobileMenu.classList.add("hidden"));
        });
    }

    // Sombra del navbar al hacer scroll
    const navbar = document.getElementById("mainNavbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar?.classList.add("shadow-md", "bg-white/95", "backdrop-blur-md");
            navbar?.classList.remove("bg-white");
        } else {
            navbar?.classList.remove("shadow-md", "backdrop-blur-md");
            navbar?.classList.add("bg-white");
        }
    });
}

// 2. Feedback dinámico de cualificación MOFU (Growth UX)
function initBudgetBadgeFeedback() {
    const budgetSelect = document.getElementById("estimated_budget");
    const qualifierBadge = document.getElementById("qualifierBadge");

    if (!budgetSelect || !qualifierBadge) return;

    budgetSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!val) {
            qualifierBadge.classList.add("hidden");
            return;
        }

        qualifierBadge.classList.remove("hidden", "bg-amber-100", "text-amber-800", "bg-emerald-100", "text-emerald-800", "bg-purple-100", "text-purple-800");

        if (val.includes("Menor a $120")) {
            qualifierBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300";
            qualifierBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> Cupo de Beca Social (Sujeto a Evaluación de Asistencia)`;
        } else if (val.includes("Más de $350") || val.includes("$220 - $350")) {
            qualifierBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300";
            qualifierBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> Prioridad de Admisión Inmediata (Plan Técnico/Avanzado)`;
        } else {
            qualifierBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300";
            qualifierBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Perfil Calificado: Apto para Matrícula Regular`;
        }
    });
}

// 3. Manejo y validación del formulario MOFU
function initQualificationForm() {
    const form = document.getElementById("mofuLeadForm");
    const submitBtn = document.getElementById("submitLeadBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const formAlert = document.getElementById("formAlert");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Ocultar alertas previas
        if (formAlert) {
            formAlert.classList.add("hidden");
            formAlert.innerHTML = "";
        }

        // Extracción de datos estrictos
        const formData = {
            full_name: document.getElementById("full_name")?.value,
            email: document.getElementById("email")?.value,
            whatsapp: document.getElementById("whatsapp")?.value,
            company: document.getElementById("company")?.value,
            estimated_budget: document.getElementById("estimated_budget")?.value,
            primary_pain: document.getElementById("primary_pain")?.value
        };

        // Validaciones UX básicas
        if (!formData.full_name || !formData.email || !formData.whatsapp || !formData.company || !formData.estimated_budget || !formData.primary_pain) {
            showFormAlert("Por favor, completa todos los campos requeridos para evaluar tu solicitud.", "error");
            return;
        }

        // Estado de carga
        toggleButtonLoading(true);

        try {
            const result = await window.supabaseService.insertLead(formData);

            // Éxito: Mostrar modal de felicitaciones
            openSuccessModal(formData, result.isDemo);

            // Resetear formulario
            form.reset();
            const qualifierBadge = document.getElementById("qualifierBadge");
            if (qualifierBadge) qualifierBadge.classList.add("hidden");

        } catch (error) {
            console.error("Fallo en captura de lead:", error);
            showFormAlert(`Hubo un error al registrar tus datos: ${error.message || "Verifica tu conexión a Supabase"}. Por favor intenta de nuevo.`, "error");
        } finally {
            toggleButtonLoading(false);
        }
    });

    function toggleButtonLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText?.classList.add("opacity-0");
            btnSpinner?.classList.remove("hidden");
        } else {
            btnText?.classList.remove("opacity-0");
            btnSpinner?.classList.add("hidden");
        }
    }

    function showFormAlert(message, type) {
        if (!formAlert) return;
        formAlert.classList.remove("hidden", "bg-red-50", "text-red-700", "border-red-200", "bg-emerald-50", "text-emerald-700", "border-emerald-200");
        if (type === "error") {
            formAlert.classList.add("bg-red-50", "text-red-700", "border-red-200", "border");
        } else {
            formAlert.classList.add("bg-emerald-50", "text-emerald-700", "border-emerald-200", "border");
        }
        formAlert.innerHTML = `<span>${message}</span>`;
    }
}

// 4. Modal de confirmación con redirección rápida a WhatsApp
function openSuccessModal(leadData, isDemo) {
    const modal = document.getElementById("successModal");
    const leadNameSpan = document.getElementById("modalLeadName");
    const demoWarning = document.getElementById("modalDemoWarning");
    const whatsappLink = document.getElementById("modalWhatsappLink");

    if (!modal) return;

    if (leadNameSpan) leadNameSpan.textContent = leadData.full_name;

    if (demoWarning) {
        if (isDemo) {
            demoWarning.classList.remove("hidden");
        } else {
            demoWarning.classList.add("hidden");
        }
    }

    if (whatsappLink) {
        const text = encodeURIComponent(
            `¡Hola! Acabo de registrar mi postulación en la web para la Unidad Educativa Agustín Cueva Dávila.\n\n` +
            `*Nombre:* ${leadData.full_name}\n` +
            `*Actividad/Empresa:* ${leadData.company}\n` +
            `*Interés Principal:* ${leadData.primary_pain}\n\n` +
            `Quisiera confirmar mi visita a las instalaciones y conocer el proceso de matrícula.`
        );
        whatsappLink.href = `https://wa.me/${window.APP_CONFIG.WHATSAPP_NUMBER}?text=${text}`;
    }

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
    }
}
window.closeSuccessModal = closeSuccessModal;

// 5. Configuración rápida de credenciales Supabase en el navegador
function initSettingsModal() {
    const settingsBtn = document.getElementById("openSettingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");

    const inputUrl = document.getElementById("cfg_supabase_url");
    const inputKey = document.getElementById("cfg_supabase_key");

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener("click", () => {
            if (inputUrl) inputUrl.value = window.APP_CONFIG.SUPABASE_URL || "";
            if (inputKey) inputKey.value = window.APP_CONFIG.SUPABASE_ANON_KEY || "";
            settingsModal.classList.remove("hidden");
        });
    }

    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener("click", () => {
            settingsModal.classList.add("hidden");
        });
    }

    if (saveSettingsBtn && settingsModal) {
        saveSettingsBtn.addEventListener("click", () => {
            const url = inputUrl?.value?.trim();
            const key = inputKey?.value?.trim();

            if (url) {
                localStorage.setItem("acd_supabase_url", url);
                window.APP_CONFIG.SUPABASE_URL = url;
            }
            if (key) {
                localStorage.setItem("acd_supabase_key", key);
                window.APP_CONFIG.SUPABASE_ANON_KEY = key;
            }

            alert("Credenciales de Supabase actualizadas exitosamente en tu navegador.");
            settingsModal.classList.add("hidden");
            window.location.reload();
        });
    }
}

// 6. Smooth Scroll para todos los botones CTA
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}

// 7. Preguntas Frecuentes (FAQ Accordion)
function initFAQ() {
    const faqButtons = document.querySelectorAll(".faq-toggle-btn");
    faqButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector(".faq-icon");
            if (content) {
                content.classList.toggle("hidden");
                if (icon) {
                    icon.classList.toggle("rotate-180");
                }
            }
        });
    });
}
