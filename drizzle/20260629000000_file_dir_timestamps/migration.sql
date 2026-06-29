ALTER TABLE "directory"
  ADD COLUMN "created_at" timestamp NOT NULL DEFAULT now(),
  ADD COLUMN "updated_at" timestamp NOT NULL DEFAULT now();

ALTER TABLE "file"
  ADD COLUMN "created_at" timestamp NOT NULL DEFAULT now(),
  ADD COLUMN "updated_at" timestamp NOT NULL DEFAULT now(),
  ADD COLUMN "is_stock" boolean NOT NULL DEFAULT false;
