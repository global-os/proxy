ALTER TABLE "instances" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
UPDATE "instances" SET "slug" = gen_random_uuid()::text WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "instances" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "instances_slug_uidx" ON "instances" USING btree ("slug");