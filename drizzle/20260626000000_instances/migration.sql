CREATE TYPE "instance_state" AS ENUM('starting', 'running', 'stopped');--> statement-breakpoint
ALTER TABLE "process" ADD COLUMN "directory_id" integer;--> statement-breakpoint
CREATE TABLE "instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"process_id" integer NOT NULL,
	"image_id" integer,
	"directory_checksum" text NOT NULL,
	"state" "instance_state" DEFAULT 'starting' NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "instances" ADD CONSTRAINT "instances_process_id_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."process"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instances" ADD CONSTRAINT "instances_image_id_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process" ADD CONSTRAINT "process_directory_id_directory_id_fkey" FOREIGN KEY ("directory_id") REFERENCES "public"."directory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "instances_process_id_idx" ON "instances" USING btree ("process_id");