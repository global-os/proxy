CREATE TABLE "workspace_window" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"process_id" integer NOT NULL,
	"instance_id" integer NOT NULL,
	"title" text NOT NULL,
	"bundle_name" text NOT NULL,
	"x" integer DEFAULT 0 NOT NULL,
	"y" integer DEFAULT 0 NOT NULL,
	"width" integer DEFAULT 720 NOT NULL,
	"height" integer DEFAULT 480 NOT NULL,
	"z_index" integer DEFAULT 1 NOT NULL,
	"last_focused_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "workspace_window" ADD CONSTRAINT "workspace_window_session_id_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_window" ADD CONSTRAINT "workspace_window_process_id_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."process"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_window" ADD CONSTRAINT "workspace_window_instance_id_instances_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workspace_window_session_id_idx" ON "workspace_window" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "workspace_window_process_id_idx" ON "workspace_window" USING btree ("process_id");--> statement-breakpoint
CREATE UNIQUE INDEX "process_session_directory_uidx" ON "process" USING btree ("session_id","directory_id");