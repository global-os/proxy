CREATE TABLE "domains" (
	"domain_id" serial PRIMARY KEY NOT NULL,
	"domain_slug" text NOT NULL,
	"user_id" integer NOT NULL,
	"cleartext" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;