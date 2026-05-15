BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_forces_parent_active
ON public.forces(parent_id)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_forces_name_trgm_active
ON public.forces USING gin (name gin_trgm_ops)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_forces_force_type_trgm_active
ON public.forces USING gin (force_type gin_trgm_ops)
WHERE is_deleted = false;

COMMIT;