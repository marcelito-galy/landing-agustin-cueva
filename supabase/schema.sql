-- ==============================================================================
-- SUPABASE SQL SCRIPT: TABLA 'leads' CON TODAS LAS COLUMNAS DEL FORMULARIO
-- Proyecto: Unidad Educativa Agustín Cueva Dávila
-- 
-- Instrucciones:
-- Copia y pega este script completo en el "SQL Editor" de Supabase y haz clic en "RUN".
-- ==============================================================================

-- 1. Habilitar extensión para generación automática de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Crear tabla principal 'leads' si no existe
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Guayaquil') NOT NULL
);

-- Asegurar que created_at esté ajustado a la hora oficial de Ecuador (America/Guayaquil, UTC-5)
ALTER TABLE public.leads 
ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE 
USING (created_at AT TIME ZONE 'America/Guayaquil');

ALTER TABLE public.leads 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'America/Guayaquil');

-- 3. Asegurar que TODAS las columnas del formulario y del sistema existan
-- (Si la tabla ya existía, ADD COLUMN IF NOT EXISTS agrega las columnas faltantes sin borrar datos)

-- Columnas del Formulario:
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estimated_budget TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS primary_pain TEXT;

-- Columnas de Metadatos y Cualificación MOFU:
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_qualified BOOLEAN DEFAULT true;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS qualification_tier TEXT DEFAULT 'TIER_B';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'nuevo';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'landing_mofu_acd_vibe';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 4. Activar Row Level Security (RLS) en la tabla 'leads'
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. Limpiar cualquier política previa para evitar conflictos
DROP POLICY IF EXISTS "Permitir inserción pública anónima de leads" ON public.leads;
DROP POLICY IF EXISTS "Permitir inserción anónima" ON public.leads;
DROP POLICY IF EXISTS "Solo administradores pueden consultar leads" ON public.leads;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anon insert" ON public.leads;
DROP POLICY IF EXISTS "Permitir insercion anonima de leads" ON public.leads;

-- 6. Crear ÚNICA política que permite INSERT a usuarios anónimos (anon)
-- (Sin políticas de SELECT, para máxima privacidad)
CREATE POLICY "Permitir insercion anonima de leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- 7. Otorgar permisos de uso e inserción al rol anónimo (anon)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.leads TO anon;

-- 8. Recargar la caché de PostgREST en Supabase inmediatamente
NOTIFY pgrst, 'reload schema';
