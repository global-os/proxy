-- Ensure every workspace session belongs to a Global PC before task migration.
INSERT INTO "global_pc" ("user_id", "name")
SELECT DISTINCT s."user_id", 'My Global PC'
FROM "sessions" s
WHERE s."global_pc_id" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "global_pc" g WHERE g."user_id" = s."user_id"
  );

UPDATE "sessions" s
SET "global_pc_id" = g."id"
FROM "global_pc" g
WHERE s."global_pc_id" IS NULL
  AND s."user_id" = g."user_id";

CREATE TABLE IF NOT EXISTS "task" (
  "id" serial PRIMARY KEY NOT NULL,
  "global_pc_id" integer NOT NULL REFERENCES "global_pc"("id") ON DELETE CASCADE,
  "directory_id" integer NOT NULL REFERENCES "directory"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "task_global_pc_id_idx" ON "task" ("global_pc_id");
CREATE UNIQUE INDEX IF NOT EXISTS "task_global_pc_directory_uidx" ON "task" ("global_pc_id", "directory_id");

-- One task per (.gapp, Global PC); merge session-scoped processes.
INSERT INTO "task" ("global_pc_id", "directory_id", "created_at", "last_used_at")
SELECT DISTINCT s."global_pc_id", p."directory_id", now(), now()
FROM "process" p
JOIN "sessions" s ON s."id" = p."session_id"
WHERE s."global_pc_id" IS NOT NULL
ON CONFLICT ("global_pc_id", "directory_id") DO NOTHING;

ALTER TABLE "instances" ADD COLUMN IF NOT EXISTS "task_id" integer REFERENCES "task"("id");
ALTER TABLE "workspace_window" ADD COLUMN IF NOT EXISTS "task_id" integer REFERENCES "task"("id");

UPDATE "instances" i
SET "task_id" = t."id"
FROM "process" p
JOIN "sessions" s ON s."id" = p."session_id"
JOIN "task" t ON t."global_pc_id" = s."global_pc_id" AND t."directory_id" = p."directory_id"
WHERE i."process_id" = p."id"
  AND i."task_id" IS NULL;

UPDATE "workspace_window" w
SET "task_id" = t."id"
FROM "process" p
JOIN "sessions" s ON s."id" = p."session_id"
JOIN "task" t ON t."global_pc_id" = s."global_pc_id" AND t."directory_id" = p."directory_id"
WHERE w."process_id" = p."id"
  AND w."task_id" IS NULL;

-- Drop legacy session-scoped process wiring.
ALTER TABLE "instances" DROP CONSTRAINT IF EXISTS "instances_process_id_process_id_fk";
ALTER TABLE "workspace_window" DROP CONSTRAINT IF EXISTS "workspace_window_process_id_process_id_fk";
DROP INDEX IF EXISTS "instances_process_id_idx";
DROP INDEX IF EXISTS "workspace_window_process_id_idx";

ALTER TABLE "instances" DROP COLUMN IF EXISTS "process_id";
ALTER TABLE "workspace_window" DROP COLUMN IF EXISTS "process_id";

ALTER TABLE "instances" ALTER COLUMN "task_id" SET NOT NULL;
ALTER TABLE "workspace_window" ALTER COLUMN "task_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "instances_task_id_idx" ON "instances" ("task_id");
CREATE INDEX IF NOT EXISTS "workspace_window_task_id_idx" ON "workspace_window" ("task_id");

DROP TABLE IF EXISTS "process";