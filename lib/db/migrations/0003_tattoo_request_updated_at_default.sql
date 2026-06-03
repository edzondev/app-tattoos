ALTER TABLE "tattoo_request" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
UPDATE "tattoo_request" SET "updatedAt" = COALESCE("createdAt", now()) WHERE "updatedAt" IS NULL;
