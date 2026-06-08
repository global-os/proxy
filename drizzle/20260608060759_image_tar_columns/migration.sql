ALTER TABLE "image" ADD COLUMN "directory_checksum" text;--> statement-breakpoint
ALTER TABLE "image" ADD COLUMN "tar_checksum" text;--> statement-breakpoint
ALTER TABLE "image" ADD COLUMN "tar_bytes" bytea;