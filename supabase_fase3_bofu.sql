-- =============================================================================
-- FASE 3 (BOFU): ACTUALIZACIÓN DE TABLA 'leads' Y MOTOR DE PRIORIZACIÓN
-- UNIDAD EDUCATIVA "AGUSTÍN CUEVA DÁVILA" - IBARRA, ECUADOR
-- =============================================================================
-- Instrucciones: Copia y pega todo este bloque en el SQL Editor de Supabase
-- y haz clic en "Run" (Ejecutar).
-- =============================================================================

-- 1. Agregar columnas necesarias para la gestión BOFU (si aún no existen)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS categoria_lead TEXT DEFAULT '❄️ Prioridad Baja',
    ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Nuevo';

-- 2. Configurar permisos y políticas RLS para lectura y actualización en tiempo real desde /admin
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.leads TO anon, authenticated;

DROP POLICY IF EXISTS "Permitir lectura de leads en bandeja BOFU" ON public.leads;
CREATE POLICY "Permitir lectura de leads en bandeja BOFU"
    ON public.leads
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica de leads" ON public.leads;
CREATE POLICY "Permitir insercion publica de leads"
    ON public.leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion de estado y score BOFU" ON public.leads;
CREATE POLICY "Permitir actualizacion de estado y score BOFU"
    ON public.leads
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Calcular y actualizar automáticamente el Score (0-100), Categoría y Estado
--    para todos los prospectos que ya existen actualmente en la tabla 'leads'
WITH scored_leads AS (
    SELECT
        id,
        (
            -- A. Regla 1: Presupuesto Estimado / Rango (Hasta 50 pts)
            CASE
                WHEN COALESCE(estimated_budget, '') ILIKE ANY (ARRAY[
                    '%350%', '%220%', '%alto%', '%completo%', '%premium%', '%avanzado%',
                    '%10D01%', '%urbano%', '%centro%'
                ])
                OR COALESCE(notes, '') ILIKE '%Lo antes posible%'
                OR COALESCE(notes, '') ILIKE '%+80%' THEN 50
                WHEN COALESCE(estimated_budget, '') ILIKE ANY (ARRAY[
                    '%120 - $220%', '%120%', '%medio%', '%estándar%', '%estandar%',
                    '%periferia%', '%rural%'
                ])
                OR COALESCE(notes, '') ILIKE '%próximo año%' THEN 30
                ELSE 10
            END
            +
            -- B. Regla 2: Dolor Principal / Obstáculo detectado (Hasta 35 pts)
            CASE
                WHEN COALESCE(primary_pain, '') ILIKE ANY (ARRAY[
                    '%segur%', '%robo%', '%hurto%', '%casillero%', '%bullying%', '%acoso%', '%violencia%', '%entorno%',
                    '%infraestructura%', '%instalacion%', '%baño%', '%bano%', '%higien%', '%limpie%', '%espacio%',
                    '%calidad%', '%académic%', '%academic%', '%ciencias%', '%técnic%', '%tecnic%', '%nivel%', '%aula%', '%laboratorio%', '%cancha%'
                ])
                OR COALESCE(notes, '') ILIKE ANY (ARRAY['%Nivel académico%', '%Instalaciones%']) THEN 35
                WHEN COALESCE(primary_pain, '') ILIKE ANY (ARRAY[
                    '%trato%', '%justo%', '%acompañamiento%', '%acompanamiento%', '%dece%', '%psicol%',
                    '%empat%', '%comunicaci%', '%docente%', '%profesor%', '%atenci%', '%discrimin%', '%igual%'
                ])
                OR COALESCE(notes, '') ILIKE '%DECE%' THEN 25
                ELSE 15
            END
            +
            -- C. Regla 3: Perfil / Datos Completos (Hasta 15 pts)
            CASE
                WHEN COALESCE(TRIM(full_name), '') <> ''
                     AND LENGTH(REGEXP_REPLACE(COALESCE(whatsapp, ''), '[^0-9]', '', 'g')) >= 7
                     AND COALESCE(TRIM(company), '') <> '' THEN 15
                ELSE 5
            END
        ) AS total_score
    FROM public.leads
)
UPDATE public.leads AS l
SET
    score = s.total_score,
    categoria_lead = CASE
        WHEN s.total_score >= 75 THEN '🔥 Prioridad Alta'
        WHEN s.total_score >= 45 THEN '⚡ Prioridad Media'
        ELSE '❄️ Prioridad Baja'
    END,
    estado = CASE
        WHEN l.estado IS NULL OR TRIM(l.estado) = '' OR LOWER(TRIM(l.estado)) = 'nuevo' THEN 'Nuevo'
        WHEN LOWER(TRIM(l.estado)) = 'contactado' THEN 'Contactado'
        WHEN LOWER(TRIM(l.estado)) = 'visita agendada' THEN 'Visita Agendada'
        WHEN LOWER(TRIM(l.estado)) = 'matriculado' THEN 'Matriculado'
        WHEN LOWER(TRIM(l.estado)) = 'descartado' THEN 'Descartado'
        ELSE 'Nuevo'
    END
FROM scored_leads AS s
WHERE l.id = s.id;

-- 4. Recargar el esquema de la API REST de Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';
