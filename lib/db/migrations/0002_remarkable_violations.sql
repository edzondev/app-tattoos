DROP INDEX "rate_limit_ip_idx";--> statement-breakpoint
ALTER TABLE "rate_limit" ADD CONSTRAINT "rate_limit_ip_idx" UNIQUE("ip");