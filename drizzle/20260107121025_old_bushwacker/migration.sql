CREATE TABLE "process" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text
);
--> statement-breakpoint
ALTER TABLE "domains" RENAME TO "process_domains";--> statement-breakpoint
ALTER TABLE "process_domains" DROP CONSTRAINT "domains_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "process_domains" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "process_domains" ADD COLUMN "process_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "process" ADD CONSTRAINT "process_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_domains" ADD CONSTRAINT "process_domains_process_id_process_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."process"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_domains" DROP COLUMN "domain_id";--> statement-breakpoint
ALTER TABLE "process_domains" DROP COLUMN "user_id";