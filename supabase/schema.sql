-- ==============================================================================
-- FASE 2: ESQUEMA DE BASE DE DATOS SUPABASE - CAPTURA DE LEADS MOFU
-- PROYECTO: UNIDAD EDUCATIVA "AGUSTÍN CUEVA DÁVILA" (IBARRA, ECUADOR)
-- TABLA: leads
-- ==============================================================================

-- 1. Habilitar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Eliminar tabla previa si se desea reiniciar esquema (opcional)
-- DROP TABLE IF EXISTS public.leads CASCADE;

-- 3. Crear tabla principal 'leads'
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Campos de captura obligatorios (Filtro MOFU)
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    company TEXT NOT NULL,                  -- Empresa / Negocio / Actividad comercial del representante
    estimated_budget TEXT NOT NULL,         -- Rango presupuestario seleccionado
    primary_pain TEXT NOT NULL,             -- Dolor o mayor obstáculo seleccionado
    
    -- Metadatos de Growth Hacking y Cualificación Automática
    is_qualified BOOLEAN DEFAULT true,      -- Flag calculado de aptitud comercial
    qualification_tier TEXT DEFAULT 'TIER_B',-- 'TIER_A' (Prioritario), 'TIER_B' (Estándar), 'DISQUALIFIED'
    lead_status TEXT DEFAULT 'nuevo',       -- 'nuevo', 'contactado', 'visita_agendada', 'matriculado', 'descartado'
    source TEXT DEFAULT 'landing_mofu_acd', -- Origen del tráfico
    notes TEXT,                             -- Notas internas del equipo de admisiones
    ip_address TEXT,                        -- Auditoría opcional
    user_agent TEXT                         -- Auditoría de dispositivo (mobile vs desktop)
);

-- 4. Comentarios descriptivos para documentación en Supabase Studio
COMMENT ON TABLE public.leads IS 'Registro de prospectos calificados MOFU para la Unidad Educativa Agustín Cueva Dávila';
COMMENT ON COLUMN public.leads.full_name IS 'Nombre completo del representante o tutor';
COMMENT ON COLUMN public.leads.email IS 'Correo electrónico para seguimiento por email marketing';
COMMENT ON COLUMN public.leads.whatsapp IS 'Número de WhatsApp con código de país para cierre rápido';
COMMENT ON COLUMN public.leads.company IS 'Empresa o actividad económica del representante';
COMMENT ON COLUMN public.leads.estimated_budget IS 'Rango presupuestario mensual para descalificación MOFU';
COMMENT ON COLUMN public.leads.primary_pain IS 'Dolor principal detectado en Fase 1 (Inseguridad, discriminación técnica, infraestructura)';
COMMENT ON COLUMN public.leads.is_qualified IS 'Booleano que clasifica al lead según el filtro presupuestario';

-- 5. Índices de alto rendimiento para el panel de admisiones
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_qualified ON public.leads (is_qualified);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (lead_status);

-- 6. Configuración de Seguridad de Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir inserción pública anónima desde la Landing Page (Anon Key)
DROP POLICY IF EXISTS "Permitir inserción pública anónima de leads" ON public.leads;
CREATE POLICY "Permitir inserción pública anónima de leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
    char_length(full_name) >= 3 AND
    char_length(email) >= 5 AND
    char_length(whatsapp) >= 8 AND
    char_length(company) >= 2
);

-- Política 2: Solo usuarios autenticados (Equipo de Admisiones / Admin) pueden leer los leads
DROP POLICY IF EXISTS "Solo administradores pueden consultar leads" ON public.leads;
CREATE POLICY "Solo administradores pueden consultar leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);

-- Política 3: Solo administradores pueden actualizar el estado del lead
DROP POLICY IF EXISTS "Solo administradores pueden actualizar leads" ON public.leads;
CREATE POLICY "Solo administradores pueden actualizar leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Vista analítica para métricas de conversión MOFU (Growth Dashboard)
CREATE OR REPLACE VIEW public.v_leads_mofu_metrics AS
SELECT 
    COUNT(*) AS total_leads,
    COUNT(*) FILTER (WHERE is_qualified = true) AS qualified_leads,
    COUNT(*) FILTER (WHERE is_qualified = false) AS disqualified_leads,
    ROUND(COUNT(*) FILTER (WHERE is_qualified = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS qualification_rate_pct,
    COUNT(*) FILTER (WHERE primary_pain ILIKE '%inseguridad%' OR primary_pain ILIKE '%robo%') AS pain_seguridad_count,
    COUNT(*) FILTER (WHERE primary_pain ILIKE '%técnico%' OR primary_pain ILIKE '%discriminación%') AS pain_discriminacion_tecnica_count,
    COUNT(*) FILTER (WHERE primary_pain ILIKE '%infraestructura%' OR primary_pain ILIKE '%deterioro%') AS pain_infraestructura_count
FROM public.leads;
