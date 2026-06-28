CREATE TABLE IF NOT EXISTS "global_pc" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text DEFAULT 'My Global PC' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "global_pc_user_id_idx" ON "global_pc" ("user_id");

CREATE TABLE IF NOT EXISTS "global_pc_icon" (
  "id" serial PRIMARY KEY NOT NULL,
  "global_pc_id" integer NOT NULL REFERENCES "global_pc"("id") ON DELETE CASCADE,
  "entry_name" text NOT NULL,
  "icon_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "global_pc_icon_global_pc_id_idx" ON "global_pc_icon" ("global_pc_id");
CREATE UNIQUE INDEX IF NOT EXISTS "global_pc_icon_entry_uidx" ON "global_pc_icon" ("global_pc_id", "entry_name");

ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "global_pc_id" integer REFERENCES "global_pc"("id");
CREATE INDEX IF NOT EXISTS "sessions_global_pc_id_idx" ON "sessions" ("global_pc_id");

-- One Global PC per existing user; attach orphan sessions.
INSERT INTO "global_pc" ("user_id", "name")
SELECT DISTINCT u."id", 'My Global PC'
FROM "user" u
WHERE NOT EXISTS (
  SELECT 1 FROM "global_pc" g WHERE g."user_id" = u."id"
);

UPDATE "sessions" s
SET "global_pc_id" = g."id"
FROM "global_pc" g
WHERE s."user_id" = g."user_id"
  AND s."global_pc_id" IS NULL;