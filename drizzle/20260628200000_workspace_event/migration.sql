CREATE TABLE IF NOT EXISTS "workspace_event" (
  "id" serial PRIMARY KEY NOT NULL,
  "workspace_id" integer NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "payload" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "workspace_event_workspace_id_idx" ON "workspace_event" ("workspace_id");
CREATE INDEX IF NOT EXISTS "workspace_event_workspace_id_id_idx" ON "workspace_event" ("workspace_id", "id");