ALTER TABLE "portfolio_item" ALTER COLUMN "style" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "portfolio_item" ALTER COLUMN "style" SET DEFAULT 'COVER_UP'::text;--> statement-breakpoint
ALTER TABLE "tattoo_request" ALTER COLUMN "style" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tattoo_request" ALTER COLUMN "style" SET DEFAULT 'COVER_UP'::text;--> statement-breakpoint
DROP TYPE "public"."TattooStyle";--> statement-breakpoint
CREATE TYPE "public"."TattooStyle" AS ENUM('COVER_UP', 'RELIGIOUS', 'PERSONALIZED', 'DOTWORK', 'SURREALISM', 'WATERCOLOR', 'GEOMETRIC');--> statement-breakpoint
ALTER TABLE "portfolio_item" ALTER COLUMN "style" SET DEFAULT 'COVER_UP'::"public"."TattooStyle";--> statement-breakpoint
ALTER TABLE "portfolio_item" ALTER COLUMN "style" SET DATA TYPE "public"."TattooStyle" USING "style"::"public"."TattooStyle";--> statement-breakpoint
ALTER TABLE "tattoo_request" ALTER COLUMN "style" SET DEFAULT 'COVER_UP'::"public"."TattooStyle";--> statement-breakpoint
ALTER TABLE "tattoo_request" ALTER COLUMN "style" SET DATA TYPE "public"."TattooStyle" USING "style"::"public"."TattooStyle";