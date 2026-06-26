ALTER TABLE "workspace_window" ADD COLUMN IF NOT EXISTS "bundle_name" text;--> statement-breakpoint
UPDATE "workspace_window" SET "bundle_name" = "title" || '.gapp' WHERE "bundle_name" IS NULL;--> statement-breakpoint
ALTER TABLE "workspace_window" ALTER COLUMN "bundle_name" SET NOT NULL;