ALTER TABLE "directory" ADD COLUMN "user_id" text REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "user_id" text REFERENCES "user"("id");--> statement-breakpoint
CREATE INDEX "directory_user_id_idx" ON "directory" ("user_id");--> statement-breakpoint
CREATE INDEX "file_user_id_idx" ON "file" ("user_id");--> statement-breakpoint
ALTER TABLE "directory" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "file" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "dir_owner" ON "directory" USING (user_id = current_setting('app.user_id', true));--> statement-breakpoint
CREATE POLICY "file_owner" ON "file" USING (user_id = current_setting('app.user_id', true));
