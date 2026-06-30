-- hash_method: always written as the constant 'sha1', never read
ALTER TABLE file DROP COLUMN IF EXISTS hash_method;

-- task_id on instances: nulled out for all process-backed instances in 20260628160000,
-- never referenced in application code since
ALTER TABLE instances DROP COLUMN IF EXISTS task_id;
DROP INDEX IF EXISTS instances_task_id_idx;
