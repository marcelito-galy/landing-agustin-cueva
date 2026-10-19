-- =========================================================================
-- FASE 3 (BOFU): ACTUALIZACIÓN DE TABLA `leads` Y MOTOR DE PRIORIZACIÓN
-- UNIDAD EDUCATIVA "AGUSTÍN CUEVA DÁVILA" - IBARRA, ECUADOR
-- =========================================================================
-- Instrucciones: Copia y pega este bloque completo en el SQL Editor de Supabase
-- y haz clic en "Run". Es 100% compatible con todas las columnas existentes.

-- 1. Agregar columnas BOFU a la tabla `leads` existente (si aún no existen)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS categoria_lead TEXT DEFAULT '❄️ Prioridad Baja',
    ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Nuevo';

-- Asegurar columnas base del formulario por si alguna faltara
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS whatsapp TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS company TEXT,
    ADD COLUMN IF NOT EXISTS estimated_budget TEXT,
    ADD COLUMN IF NOT EXISTS primary_pain TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Asegurar valores por defecto en registros previos que tengan NULL
UPDATE public.leads
SET
    score = COALESCE(score, 0),
    categoria_lead = COALESCE(categoria_lead, '❄️ Prioridad Baja'),
    estado = COALESCE(estado, 'Nuevo')
WHERE score IS NULL OR categoria_lead IS NULL OR estado IS NULL;

-- 3. Habilitar políticas RLS para que la Bandeja de Administración (/admin)
--    pueda leer (SELECT), insertar (INSERT) y actualizar (UPDATE) estados y scores en tiempo real
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir insercion publica de leads" ON public.leads;
CREATE POLICY "Permitir insercion publica de leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de leads para bandeja admin BOFU" ON public.leads;
CREATE POLICY "Permitir lectura de leads para bandeja admin BOFU"
ON public.leads
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir actualizacion de estado y score en bandeja admin BOFU" ON public.leads;
CREATE POLICY "Permitir actualizacion de estado y score en bandeja admin BOFU"
ON public.leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.leads TO anon, authenticated;

-- 4. Backfill automático: Calcular Score (0-100) y Categoría para los leads ya existentes
--    Usa to_jsonb(leads) para ser 100% inmune a nombres de columnas opcionales
UPDATE public.leads
SET
    score = (
        -- A. Por Presupuesto Estimado / Rango (Hasta 50 pts)
        CASE
            WHEN COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Alto%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Completo%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Premium%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Avanzado%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%350%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%220%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%10D01%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Urbano%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Centro%'
              OR COALESCE(to_jsonb(leads)->>'notes', '') ILIKE '%Lo antes posible%'
              OR COALESCE(to_jsonb(leads)->>'notes', '') ILIKE '%Este mes%'
            THEN 50
            WHEN COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Medio%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Estándar%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Estandar%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%120%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Periferia%'
              OR COALESCE(to_jsonb(leads)->>'estimated_budget', to_jsonb(leads)->>'rango_presupuesto', to_jsonb(leads)->>'sector_residencia', '') ILIKE '%Sur%'
              OR COALESCE(to_jsonb(leads)->>'notes', '') ILIKE '%Próximo año%'
            THEN 30
            ELSE 10
        END
        +
        -- B. Por Dolor Principal / Obstáculo detectado (Hasta 35 pts)
        CASE
            WHEN COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Segur%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Entorno%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Robo%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Casillero%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Infraestructura%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Instalacion%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Higien%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Calidad%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Académic%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Academic%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Ciencias%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Técnic%'
            THEN 35
            WHEN COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Trato%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Justo%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Acompañamiento%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Acompanamiento%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%DECE%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Valores%'
              OR COALESCE(to_jsonb(leads)->>'primary_pain', to_jsonb(leads)->>'dolor_principal', '') ILIKE '%Docente%'
            THEN 25
            ELSE 15
        END
        +
        -- C. Por Perfil / Datos Completos (Hasta 15 pts)
        CASE
            WHEN LENGTH(REGEXP_REPLACE(COALESCE(to_jsonb(leads)->>'whatsapp', ''), '[^0-9]', '', 'g')) >= 7
             AND LENGTH(TRIM(COALESCE(to_jsonb(leads)->>'company', to_jsonb(leads)->>'occupation', ''))) >= 2
             AND LENGTH(TRIM(COALESCE(to_jsonb(leads)->>'full_name', ''))) >= 3
            THEN 15
            WHEN LENGTH(TRIM(COALESCE(to_jsonb(leads)->>'full_name', ''))) >= 3
             AND LENGTH(REGEXP_REPLACE(COALESCE(to_jsonb(leads)->>'whatsapp', ''), '[^0-9]', '', 'g')) >= 7
            THEN 8
            ELSE 5
        END
    );

-- 5. Clasificar automáticamente según el Score total (0-100 pts)
UPDATE public.leads
SET categoria_lead = CASE
    WHEN score >= 75 THEN '🔥 Prioridad Alta'
    WHEN score >= 45 THEN '⚡ Prioridad Media'
    ELSE '❄️ Prioridad Baja'
END;

-- 6. Índices para acelerar ordenamiento BOFU por score y filtros por categoría/estado
CREATE INDEX IF NOT EXISTS idx_leads_score_desc ON public.leads (score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_categoria_lead ON public.leads (categoria_lead);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON public.leads (estado);

-- 7. Recargar caché de esquema de PostgREST (Supabase API)
NOTIFY pgrst, 'reload schema';
