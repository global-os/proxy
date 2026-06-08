CREATE TYPE "process_domain_type" AS ENUM('proxy', 'local_exe');--> statement-breakpoint
CREATE TABLE "directory" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"parent_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image" (
	"id" serial PRIMARY KEY,
	"directory_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "process_domains" ADD COLUMN "type" "process_domain_type" DEFAULT 'proxy'::"process_domain_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "process_domains" ADD COLUMN "image_id" integer;--> statement-breakpoint
ALTER TABLE "directory" ADD CONSTRAINT "directory_parent_id_directory_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "directory"("id");--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_parent_id_directory_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "directory"("id");--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_directory_id_directory_id_fkey" FOREIGN KEY ("directory_id") REFERENCES "directory"("id");--> statement-breakpoint
ALTER TABLE "process_domains" ADD CONSTRAINT "process_domains_image_id_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image"("id");