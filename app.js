/**
 * CONTROLADOR PRINCIPAL DE LA LANDING PAGE
 * UNIDAD EDUCATIVA AGUSTÍN CUEVA DÁVILA (IBARRA, ECUADOR)
 * 
 * Vibe Coding: Modern UI/UX, Interactive Tabs, Multimedia Slider,
 * Video Lightbox, Scroll Reveal Animations & Supabase MOFU Integration.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar iconos Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. Módulos de interfaz y animaciones
    initNavigation();
    initScrollAnimations();
    initFloatingCTA();
    initEducationalTabs();
    initMultimediaSlider();
    initVideoLightbox();
    initFAQ();

    // 3. Módulos de captura y cualificación MOFU
    initBudgetBadgeFeedback();
    initQualificationForm();
    initSettingsModal();
    initSmoothScroll();
});

// ==============================================================================
// 1. NAVEGACIÓN Y STICKY HEADER
// ==============================================================================
function initNavigation() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const navbar = document.getElementById("mainNavbar");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
            if (window.lucide) window.lucide.createIcons();
        });

        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => mobileMenu.classList.add("hidden"));
        });
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 25) {
            navbar?.classList.add("shadow-lg", "bg-[#0F2C59]/95", "backdrop-blur-md", "py-3");
            navbar?.classList.remove("bg-[#0F2C59]", "py-4");
        } else {
            navbar?.classList.remove("shadow-lg", "backdrop-blur-md", "py-3");
            navbar?.classList.add("bg-[#0F2C59]", "py-4");
        }
    });
}

// ==============================================================================
// 2. ANIMACIONES FLUIDAS EN SCROLL (SCROLL REVEAL CON INTERSECTION OBSERVER)
// ==============================================================================
function initScrollAnimations() {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    if (!("IntersectionObserver" in window)) {
        // Fallback si el navegador es antiguo
        revealElements.forEach(el => el.classList.remove("opacity-0", "translate-y-8"));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("opacity-0", "translate-y-8");
                entry.target.classList.add("opacity-100", "translate-y-0");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
}

// ==============================================================================
// 3. BOTÓN FLOTANTE DE ACCIÓN (FLOATING CTA)
// ==============================================================================
function initFloatingCTA() {
    const floatingBtn = document.getElementById("floatingCtaBtn");
    if (!floatingBtn) return;

    window.addEventListener("scroll", () => {
        // Mostrar botón flotante tras pasar 350px de scroll
        if (window.scrollY > 350) {
            floatingBtn.classList.remove("translate-y-24", "opacity-0", "pointer-events-none");
            floatingBtn.classList.add("translate-y-0", "opacity-100", "pointer-events-auto");
        } else {
            floatingBtn.classList.add("translate-y-24", "opacity-0", "pointer-events-none");
            floatingBtn.classList.remove("translate-y-0", "opacity-100", "pointer-events-auto");
        }
    });
}

// ==============================================================================
// 4. SISTEMA DE PESTAÑAS (TABS) INTERACTIVAS DE MODALIDADES EDUCATIVAS
// ==============================================================================
function initEducationalTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    if (!tabButtons.length || !tabPanels.length) return;

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-tab-target");

            // Desactivar todos los botones
            tabButtons.forEach(btn => {
                btn.classList.remove("bg-[#0B3B2C]", "bg-[#0F2C59]", "text-white", "shadow-md");
                btn.classList.add("bg-white", "text-slate-700", "hover:bg-slate-100");
                btn.setAttribute("aria-selected", "false");
            });

            // Activar botón seleccionado
            button.classList.add("bg-[#0B3B2C]", "text-white", "shadow-md");
            button.classList.remove("bg-white", "text-slate-700", "hover:bg-slate-100");
            button.setAttribute("aria-selected", "true");

            // Ocultar y mostrar paneles correspondientes con micro-fade
            tabPanels.forEach(panel => {
                if (panel.id === targetId) {
                    panel.classList.remove("hidden");
                    panel.classList.add("animate-fadeIn");
                } else {
                    panel.classList.add("hidden");
                    panel.classList.remove("animate-fadeIn");
                }
            });

            if (window.lucide) window.lucide.createIcons();
        });
    });
}

// ==============================================================================
// 5. CARRUSEL MULTIMEDIA INTERACTIVO (SLIDER DE INSTALACIONES Y ESPACIOS DIGNOS)
// ==============================================================================
function initMultimediaSlider() {
    const track = document.getElementById("sliderTrack");
    const prevBtn = document.getElementById("sliderPrevBtn");
    const nextBtn = document.getElementById("sliderNextBtn");
    const dotsContainer = document.getElementById("sliderDots");

    if (!track) return;

    const slides = track.querySelectorAll(".slider-slide");
    if (!slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoSlideInterval = null;

    // Crear dots de navegación
    if (dotsContainer) {
        dotsContainer.innerHTML = "";
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", `Ir a imagen ${i + 1}`);
            dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${i === 0 ? "bg-[#1E56A0] w-8" : "bg-slate-300 hover:bg-slate-400"}`;
            dot.addEventListener("click", () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Actualizar dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll("button");
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.className = "w-8 h-3 rounded-full bg-[#1E56A0] transition-all duration-300";
                } else {
                    dot.className = "w-3 h-3 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300";
                }
            });
        }
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
    }

    if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); resetAutoplay(); });

    // Autoplay cada 5 segundos
    function startAutoplay() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    const sliderContainer = document.getElementById("sliderContainer");
    if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", stopAutoplay);
        sliderContainer.addEventListener("mouseleave", startAutoplay);
    }

    // Soporte para gestos táctiles (Swipe en móvil)
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 45;
        if (touchEndX < touchStartX - threshold) {
            nextSlide();
            resetAutoplay();
        } else if (touchEndX > touchStartX + threshold) {
            prevSlide();
            resetAutoplay();
        }
    }

    startAutoplay();
}

// ==============================================================================
// 6. VIDEO LIGHTBOX MODAL (REELS Y VIDEOS INSTITUCIONALES 30s)
// ==============================================================================
function initVideoLightbox() {
    const videoModal = document.getElementById("videoModal");
    const openVideoBtns = document.querySelectorAll(".open-video-btn");
    const closeVideoBtn = document.getElementById("closeVideoBtn");
    const videoFrame = document.getElementById("videoPlayerContainer");

    if (!videoModal) return;

    openVideoBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const videoType = btn.getAttribute("data-video-type") || "reel_30s";
            loadVideoContent(videoType);
            videoModal.classList.remove("hidden");
            document.body.classList.add("overflow-hidden");
            if (window.lucide) window.lucide.createIcons();
        });
    });

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener("click", closeVideo);
    }

    videoModal.addEventListener("click", (e) => {
        if (e.target === videoModal) closeVideo();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !videoModal.classList.contains("hidden")) {
            closeVideo();
        }
    });

    function closeVideo() {
        videoModal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
        if (videoFrame) videoFrame.innerHTML = "";
    }

    function loadVideoContent(type) {
        if (!videoFrame) return;

        const videoSrc = window.APP_CONFIG?.INSTITUTIONAL_VIDEO_URL || "assets/videos/video-institucional.mp4";

        // Caso 1: Enlace de YouTube o Vimeo
        if (videoSrc.includes("youtube.com") || videoSrc.includes("youtu.be")) {
            let embedUrl = videoSrc;
            if (videoSrc.includes("watch?v=")) {
                const videoId = videoSrc.split("watch?v=")[1].split("&")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            } else if (videoSrc.includes("youtu.be/")) {
                const videoId = videoSrc.split("youtu.be/")[1].split("?")[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            }

            videoFrame.innerHTML = `
                <div class="relative w-full aspect-video max-w-2xl mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30">
                    <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
            return;
        }

        // Caso 2: Archivo de Video MP4 local (con fallback interactivo si el archivo aún no existe)
        videoFrame.innerHTML = `
            <div class="relative w-full aspect-[9/16] sm:aspect-video max-h-[80vh] max-w-2xl mx-auto bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-6 text-white border-2 border-emerald-500/40">
                
                <!-- Video Element HTML5 -->
                <video id="acdInstitutionalVideo" controls autoplay playsinline class="absolute inset-0 w-full h-full object-cover z-0">
                    <source src="${videoSrc}" type="video/mp4">
                    <source src="videos/video-institucional.mp4" type="video/mp4">
                    Tu navegador no soporta reproducción de video HTML5.
                </video>

                <!-- Overlay de Contingencia si el archivo local aún no se ha copiado -->
                <div id="videoFallbackOverlay" class="hidden absolute inset-0 bg-[#0A192F]/95 z-10 flex flex-col justify-between p-6 text-center">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Video Institucional (30s)</span>
                        <span class="text-xs text-slate-400">Agustín Cueva Dávila</span>
                    </div>

                    <div class="my-auto space-y-3 px-2">
                        <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto border border-emerald-400/30">
                            🎬
                        </div>
                        <h4 class="text-base sm:text-lg font-extrabold text-white">
                            "En Agustín Cueva Dávila, cada estudiante importa igual"
                        </h4>
                        <p class="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                            Para reproducir tu propio video en este espacio, solo debes guardar tu archivo <strong>.mp4</strong> en:
                        </p>
                        <div class="p-2.5 bg-black/60 rounded-xl text-[11px] font-mono text-emerald-400 border border-emerald-500/30 max-w-sm mx-auto">
                            assets/videos/video-institucional.mp4
                        </div>
                    </div>

                    <div class="pt-3 border-t border-white/10">
                        <a href="#formulario-admision" onclick="document.getElementById('videoModal').classList.add('hidden'); document.body.classList.remove('overflow-hidden');" class="block w-full py-3 px-4 rounded-xl bg-[#0B3B2C] hover:bg-[#135D43] text-white font-extrabold text-xs transition-colors">
                            Agendar Visita a las Instalaciones &rarr;
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Si el video falla al cargar (por ejemplo, porque el usuario aún no coloca el archivo en assets/videos/), mostrar el overlay instructivo
        const vidElem = document.getElementById("acdInstitutionalVideo");
        const fallbackOverlay = document.getElementById("videoFallbackOverlay");
        if (vidElem && fallbackOverlay) {
            vidElem.addEventListener("error", () => {
                fallbackOverlay.classList.remove("hidden");
            });
        }
    }
}

// ==============================================================================
// 7. FEEDBACK DINÁMICO DE CUALIFICACIÓN MOFU
// ==============================================================================
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

        qualifierBadge.classList.remove("hidden", "bg-amber-100", "text-amber-800", "bg-emerald-100", "text-emerald-800", "bg-blue-100", "text-blue-900");

        if (val.includes("Menor a $120")) {
            qualifierBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse";
            qualifierBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> Postulación a Comité de Beca Social`;
        } else if (val.includes("Más de $350") || val.includes("$220 - $350")) {
            qualifierBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300";
            qualifierBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span> Prioridad Alta: Apto para Matrícula Directa`;
        } else {
            qualifierBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
            qualifierBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Perfil Calificado: Plan Estándar Regular`;
        }
    });
}

// ==============================================================================
// 8. FORMULARIO MOFU & INTEGRACIÓN DIRECTA CON SUPABASE
// ==============================================================================
function initQualificationForm() {
    const form = document.getElementById("mofuLeadForm");
    const submitBtn = document.getElementById("submitLeadBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const formAlert = document.getElementById("formAlert");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (formAlert) {
            formAlert.classList.add("hidden");
            formAlert.innerHTML = "";
        }

        const formData = {
            full_name: document.getElementById("full_name")?.value,
            email: document.getElementById("email")?.value,
            whatsapp: document.getElementById("whatsapp")?.value,
            company: document.getElementById("company")?.value,
            estimated_budget: document.getElementById("estimated_budget")?.value,
            primary_pain: document.getElementById("primary_pain")?.value
        };

        // Validación en tiempo real de campos obligatorios
        if (!formData.full_name || !formData.email || !formData.whatsapp || !formData.company || !formData.estimated_budget || !formData.primary_pain) {
            showFormAlert("Por favor completa todos los campos para evaluar la disponibilidad de cupo.", "error");
            return;
        }

        toggleButtonLoading(true);

        try {
            const result = await window.supabaseService.insertLead(formData);

            openSuccessModal(formData, result.isDemo);
            form.reset();

            const qualifierBadge = document.getElementById("qualifierBadge");
            if (qualifierBadge) qualifierBadge.classList.add("hidden");

        } catch (error) {
            console.error("❌ [Form Submission Error] Error al enviar lead a Supabase:", error);
            console.log("🔍 [Debug Info Supabase Error]:", {
                name: error.name,
                message: error.message,
                stack: error.stack,
                formDataEnviada: formData,
                timestamp: new Date().toISOString()
            });

            let displayMessage = error.message || "Error de conexión con Supabase";
            if (displayMessage.includes("Invalid path specified") || displayMessage.includes("PGRST125")) {
                displayMessage = "URL de Supabase incorrecta. Debe ser únicamente 'https://tu-proyecto.supabase.co' (sin '/rest/v1' ni '/leads' al final). La hemos auto-corregido para tu próximo envío.";
            } else if (displayMessage.includes("Could not find the table") || displayMessage.includes("PGRST205")) {
                displayMessage = "La tabla 'public.leads' no existe en Supabase. Por favor ejecuta el script schema.sql en el SQL Editor de tu proyecto.";
            }

            const targetUrl = window.APP_CONFIG?.SUPABASE_URL || "Supabase";
            showFormAlert(`Error al registrar en Supabase [${targetUrl}]: ${displayMessage}`, "error");
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

// ==============================================================================
// 9. MODAL DE ÉXITO Y REDIRECCIÓN RÁPIDA A WHATSAPP
// ==============================================================================
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
        const fechaStr = window.supabaseService?.getEcuadorReadableDate ? window.supabaseService.getEcuadorReadableDate() : new Date().toLocaleDateString("es-EC");
        const text = encodeURIComponent(
            `¡Hola! Acabo de registrar mi postulación en la web de la Unidad Educativa Agustín Cueva Dávila.\n\n` +
            `*Fecha:* ${fechaStr}\n` +
            `*Nombre:* ${leadData.full_name}\n` +
            `*Actividad/Empresa:* ${leadData.company}\n` +
            `*Preocupación Principal:* ${leadData.primary_pain}\n` +
            `*Presupuesto Estimado:* ${leadData.estimated_budget}\n\n` +
            `Quisiera confirmar la visita guiada para conocer las aulas e iniciar mi proceso de matrícula.`
        );
        whatsappLink.href = `https://wa.me/${window.APP_CONFIG.WHATSAPP_NUMBER}?text=${text}`;
    }

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    if (window.lucide) window.lucide.createIcons();
}

function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
    }
}
window.closeSuccessModal = closeSuccessModal;

// ==============================================================================
// 10. MODAL DE CONFIGURACIÓN RÁPIDA DE CREDENCIALES SUPABASE
// ==============================================================================
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
            if (window.lucide) window.lucide.createIcons();
        });
    }

    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener("click", () => {
            settingsModal.classList.add("hidden");
        });
    }

    if (saveSettingsBtn && settingsModal) {
        saveSettingsBtn.addEventListener("click", () => {
            const rawUrl = inputUrl?.value?.trim();
            const rawKey = inputKey?.value?.trim();

            if (rawUrl) {
                let cleanUrl = rawUrl.replace(/^["']|["']$/g, '');
                if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
                    if (/^[a-z0-9-]+$/i.test(cleanUrl)) {
                        cleanUrl = `https://${cleanUrl}.supabase.co`;
                    } else {
                        cleanUrl = `https://${cleanUrl}`;
                    }
                }
                try {
                    cleanUrl = new URL(cleanUrl).origin;
                } catch(e) {
                    cleanUrl = cleanUrl.replace(/\/rest\/v1.*$/i, '').replace(/\/+$/, '');
                }
                localStorage.setItem("acd_supabase_url", cleanUrl);
                window.APP_CONFIG.SUPABASE_URL = cleanUrl;
                if (inputUrl) inputUrl.value = cleanUrl;
            }
            if (rawKey) {
                const cleanKey = rawKey.replace(/^["']|["']$/g, '');
                localStorage.setItem("acd_supabase_key", cleanKey);
                window.APP_CONFIG.SUPABASE_ANON_KEY = cleanKey;
            }

            alert("Credenciales de Supabase actualizadas y normalizadas con éxito.");
            settingsModal.classList.add("hidden");
            window.location.reload();
        });
    }
}

// ==============================================================================
// 11. SMOOTH SCROLL PARA ANCLAS Y BOTONES
// ==============================================================================
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

// ==============================================================================
// 12. PREGUNTAS FRECUENTES (FAQ ACCORDION)
// ==============================================================================
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
