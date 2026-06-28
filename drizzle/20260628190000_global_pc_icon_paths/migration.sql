-- Migrate legacy short icon ids to absolute .Resources paths.
UPDATE "global_pc_icon"
SET "icon_id" = '/.Resources/icons/16x16/' || "icon_id" || '.bmp'
WHERE "icon_id" NOT LIKE '/.Resources/%'
  AND "icon_id" ~ '^[a-z0-9-]+$';