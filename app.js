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

    // 3. Módulo de Wizard Interactivo de Cualificación (Typeform style)
    initQualificationWizard();
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
                            Consulta disponibilidad de cupos &rarr;
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
// 7. WIZARD INTERACTIVO DE CUALIFICACIÓN (TYPEFORM STYLE & SCORING)
// ==============================================================================
function initQualificationWizard() {
    const wizardCard = document.getElementById("cuposWizardCard");
    if (!wizardCard) return;

    // Estado interno del Wizard
    const wizardState = {
        currentStep: 1,
        totalSteps: 3,
        answers: {
            q1: null, // Nivel educativo
            q2: null, // Prioridad
            q3: null  // Urgencia
        },
        points: {
            q1: 0,
            q2: 0,
            q3: 0
        }
    };

    // Referencias a los pasos del DOM
    const step1El = document.getElementById("wizardStep1");
    const step2El = document.getElementById("wizardStep2");
    const step3El = document.getElementById("wizardStep3");
    const stepResultEl = document.getElementById("wizardStepResult");

    const steps = [null, step1El, step2El, step3El, stepResultEl];

    // Barra de progreso y badges
    const progressBar = document.getElementById("wizardProgressBar");
    const stepLabel = document.getElementById("wizardStepLabel");
    const progressPercentage = document.getElementById("wizardProgressPercentage");

    // Elementos de la pantalla de resultado
    const scoreBadgeContainer = document.getElementById("wizardScoreBadgeContainer");
    const calculatedScoreText = document.getElementById("wizardCalculatedScoreText");
    const summaryLevelText = document.getElementById("summaryLevelText");
    const summaryPriorityText = document.getElementById("summaryPriorityText");
    const summaryUrgencyText = document.getElementById("summaryUrgencyText");
    const whatsappBtn = document.getElementById("wizardWhatsappBtn");
    const restartBtn = document.getElementById("wizardRestartBtn");

    // Click en opciones
    const optionButtons = wizardCard.querySelectorAll(".wizard-option-btn");
    optionButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const stepNum = parseInt(btn.getAttribute("data-step"), 10);
            const value = btn.getAttribute("data-value");
            const points = parseInt(btn.getAttribute("data-points") || "0", 10);

            handleOptionSelect(stepNum, value, points, btn);
        });
    });

    // Click en botón volver
    const backButtons = wizardCard.querySelectorAll(".wizard-back-btn");
    backButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (wizardState.currentStep > 1) {
                goToStep(wizardState.currentStep - 1);
            }
        });
    });

    // Click en reiniciar
    if (restartBtn) {
        restartBtn.addEventListener("click", () => {
            resetWizard();
        });
    }

    function handleOptionSelect(stepNum, value, points, clickedBtn) {
        // Feedback visual inmediato en la opción seleccionada
        const parentStep = clickedBtn.closest(".wizard-step");
        if (parentStep) {
            parentStep.querySelectorAll(".wizard-option-btn").forEach(b => {
                b.classList.remove("border-[#0B3B2C]", "bg-emerald-50", "ring-2", "ring-[#0B3B2C]");
            });
            clickedBtn.classList.add("border-[#0B3B2C]", "bg-emerald-50", "ring-2", "ring-[#0B3B2C]");
        }

        // Guardar valores en el estado interno
        if (stepNum === 1) {
            wizardState.answers.q1 = value;
            wizardState.points.q1 = points;
        } else if (stepNum === 2) {
            wizardState.answers.q2 = value;
            wizardState.points.q2 = points;
        } else if (stepNum === 3) {
            wizardState.answers.q3 = value;
            wizardState.points.q3 = points;
        }

        // Pequeño retardo de 220ms para percibir la animación de selección y pasar al siguiente paso
        setTimeout(() => {
            if (stepNum < 3) {
                goToStep(stepNum + 1);
            } else {
                finishWizard();
            }
        }, 220);
    }

    function goToStep(targetStep) {
        const currentEl = steps[wizardState.currentStep];
        const nextEl = steps[targetStep];

        if (!currentEl || !nextEl) return;

        // Desvanecer el paso actual
        currentEl.classList.remove("opacity-100");
        currentEl.classList.add("opacity-0");

        setTimeout(() => {
            currentEl.classList.add("hidden");
            wizardState.currentStep = targetStep;

            updateProgressUI(targetStep);

            nextEl.classList.remove("hidden");
            // Forzar reflow para que la transición CSS opere fluidamente
            void nextEl.offsetWidth;
            nextEl.classList.remove("opacity-0");
            nextEl.classList.add("opacity-100");

            if (window.lucide) window.lucide.createIcons();
        }, 180);
    }

    function updateProgressUI(step) {
        if (!progressBar || !stepLabel || !progressPercentage) return;

        if (step <= 3) {
            const pct = Math.round((step / 3) * 100);
            progressBar.style.width = `${pct}%`;
            stepLabel.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Paso ${step} de 3</span>`;
            progressPercentage.textContent = `${pct}% completado`;
        } else {
            progressBar.style.width = "100%";
            stepLabel.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span><span>¡Test Completado!</span>`;
            progressPercentage.textContent = "100% completado";
        }
    }

    function finishWizard() {
        // Cálculo del Score de Urgencia
        const totalScore = (wizardState.points.q1 || 10) + (wizardState.points.q2 || 10) + (wizardState.points.q3 || 10);
        const scoreString = `${totalScore}/100`;

        // Mostrar pantalla de resultado
        goToStep(4);

        // Actualizar resumen en la tarjeta
        if (calculatedScoreText) calculatedScoreText.textContent = scoreString;
        if (summaryLevelText) summaryLevelText.textContent = wizardState.answers.q1 || "Educación Básica";
        if (summaryPriorityText) summaryPriorityText.textContent = wizardState.answers.q2 || "Nivel académico y malla curricular";
        if (summaryUrgencyText) summaryUrgencyText.textContent = wizardState.answers.q3 || "Lo antes posible / Este mes";

        // Estilos dinámicos del badge de urgencia
        if (scoreBadgeContainer) {
            scoreBadgeContainer.className = "my-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold border shadow-sm";
            if (totalScore >= 90) {
                // Score 100/100
                scoreBadgeContainer.classList.add("bg-emerald-50", "text-emerald-900", "border-emerald-300");
                scoreBadgeContainer.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span><span>Nivel de Urgencia Calculado: </span><span class="text-base font-black text-emerald-950">${scoreString} (Prioridad Alta)</span>`;
            } else if (totalScore >= 50) {
                // Score 60/100
                scoreBadgeContainer.classList.add("bg-blue-50", "text-blue-900", "border-blue-300");
                scoreBadgeContainer.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span>Nivel de Urgencia Calculado: </span><span class="text-base font-black text-blue-950">${scoreString} (Próximo Periodo)</span>`;
            } else {
                // Score 30/100
                scoreBadgeContainer.classList.add("bg-slate-100", "text-slate-800", "border-slate-300");
                scoreBadgeContainer.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Nivel de Urgencia Calculado: </span><span class="text-base font-black text-slate-900">${scoreString} (Informativo)</span>`;
            }
        }

        // Formato exacto del mensaje de WhatsApp solicitado:
        // "Hola Unidad Educativa Agustín Cueva. Completé el test en su web. Busco información de cupos para [Respuesta_Pregunta1]. Necesito esto [Respuesta_Pregunta3] y me interesa especialmente su [Respuesta_Pregunta2]. Mi nivel de urgencia es: [Score_Calculado/100]. ¿Me ayudan con los requisitos?"
        const whatsappMsg = `Hola Unidad Educativa Agustín Cueva. Completé el test en su web. Busco información de cupos para ${wizardState.answers.q1}. Necesito esto ${wizardState.answers.q3} y me interesa especialmente su ${wizardState.answers.q2}. Mi nivel de urgencia es: ${scoreString}. ¿Me ayudan con los requisitos?`;

        const whatsappNumber = window.APP_CONFIG?.WHATSAPP_NUMBER || "593998765432";
        const targetWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

        if (whatsappBtn) {
            whatsappBtn.href = targetWhatsappUrl;
        }

        // Registro silencioso en segundo plano en Supabase (evita fricción y conserva la analítica en la nube)
        try {
            if (window.supabaseService && typeof window.supabaseService.insertLead === 'function') {
                window.supabaseService.insertLead({
                    full_name: `Prospecto (${wizardState.answers.q1})`,
                    email: `lead_${Date.now()}@whatsapp.acd.edu.ec`,
                    whatsapp: "Canal WhatsApp Directo",
                    company: wizardState.answers.q1,
                    estimated_budget: `Score: ${scoreString}`,
                    primary_pain: wizardState.answers.q2,
                    notes: `Wizard: Nivel=${wizardState.answers.q1} | Prioridad=${wizardState.answers.q2} | Urgencia=${wizardState.answers.q3} | Score=${scoreString}`
                }).then(() => {
                    console.log("✅ [Wizard] Prospecto registrado en Supabase.");
                }).catch(err => {
                    console.log("ℹ️ [Wizard] Nota background Supabase:", err?.message || err);
                });
            }
        } catch (e) {
            // Silencioso para asegurar que la redirección fluya siempre
        }
    }

    function resetWizard() {
        wizardState.currentStep = 1;
        wizardState.answers = { q1: null, q2: null, q3: null };
        wizardState.points = { q1: 0, q2: 0, q3: 0 };

        optionButtons.forEach(btn => {
            btn.classList.remove("border-[#0B3B2C]", "bg-emerald-50", "ring-2", "ring-[#0B3B2C]");
        });

        steps.slice(1).forEach(el => {
            if (el) {
                el.classList.add("hidden", "opacity-0");
                el.classList.remove("opacity-100");
            }
        });

        if (step1El) {
            step1El.classList.remove("hidden");
            void step1El.offsetWidth;
            step1El.classList.remove("opacity-0");
            step1El.classList.add("opacity-100");
        }

        updateProgressUI(1);
        if (window.lucide) window.lucide.createIcons();
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
