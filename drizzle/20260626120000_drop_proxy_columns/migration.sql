ALTER TABLE "instances" DROP COLUMN IF EXISTS "podman_image_ref";--> statement-breakpoint
ALTER TABLE "instances" DROP COLUMN IF EXISTS "podman_container_id";--> statement-breakpoint
ALTER TABLE "instances" DROP COLUMN IF EXISTS "cleartext";--> statement-breakpoint
DROP TABLE IF EXISTS "process_domains";--> statement-breakpoint
DROP TYPE IF EXISTS "process_domain_type";