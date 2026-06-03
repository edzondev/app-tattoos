ALTER TABLE "tattoo_request" ADD COLUMN "selectedImageWatermarkedR2Key" text;--> statement-breakpoint
ALTER TABLE "tattoo_request" ADD COLUMN "mpPreferenceId" text;--> statement-breakpoint
ALTER TABLE "tattoo_request" ADD COLUMN "mpPaymentId" text;--> statement-breakpoint
ALTER TABLE "tattoo_request" ADD COLUMN "paymentStatus" text;--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_ip_idx" ON "rate_limit" USING btree ("ip");