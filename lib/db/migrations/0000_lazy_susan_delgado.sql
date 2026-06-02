CREATE TYPE "public"."ColorMode" AS ENUM('BLACK_AND_GREY', 'COLOR');--> statement-breakpoint
CREATE TYPE "public"."RequestStatus" AS ENUM('SENT', 'QUOTED', 'APPOINTMENT_CONFIRMED', 'FINISHED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."TattooSize" AS ENUM('SMALL', 'MEDIUM', 'LARGE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."TattooStyle" AS ENUM('COVER_UP', 'RELIGIOUS', 'PERSONALIZED', 'DOTWORK', 'SURREALISM', 'MISCELLANEOUS', 'WATERCOLOR', 'GEOMETRIC');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_image" (
	"id" text PRIMARY KEY NOT NULL,
	"itemId" text NOT NULL,
	"r2Key" text NOT NULL,
	"publicUrl" text,
	"mimeType" text,
	"sizeBytes" integer,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_item" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"style" "TattooStyle" DEFAULT 'MISCELLANEOUS' NOT NULL,
	"bodyZone" text,
	"colorMode" "ColorMode" DEFAULT 'BLACK_AND_GREY' NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"ip" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reference_image" (
	"id" text PRIMARY KEY NOT NULL,
	"requestId" text NOT NULL,
	"r2Key" text NOT NULL,
	"publicUrl" text,
	"mimeType" text,
	"sizeBytes" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tattoo_request" (
	"id" text PRIMARY KEY NOT NULL,
	"requestCode" text,
	"trackingToken" text NOT NULL,
	"status" "RequestStatus",
	"title" text,
	"style" "TattooStyle" DEFAULT 'MISCELLANEOUS' NOT NULL,
	"styleOther" text,
	"bodyZone" text NOT NULL,
	"size" "TattooSize" DEFAULT 'OTHER' NOT NULL,
	"sizeNotes" text,
	"colorMode" "ColorMode" DEFAULT 'BLACK_AND_GREY' NOT NULL,
	"detailLevel" integer DEFAULT 3 NOT NULL,
	"generationCount" integer DEFAULT 0 NOT NULL,
	"specialInstructions" text,
	"finalPrompt" text,
	"selectedImageR2Key" text,
	"selectedImagePublicUrl" text,
	"selectedImageMimeType" text,
	"selectedImageSizeBytes" integer,
	"fullName" text,
	"whatsappE164" text,
	"district" text,
	"availability" text,
	"extraComments" text,
	"currency" text DEFAULT 'PEN' NOT NULL,
	"priceCents" integer,
	"depositCents" integer,
	"depositDueAt" timestamp,
	"sentAt" timestamp,
	"quotedAt" timestamp,
	"depositConfirmedAt" timestamp,
	"appointmentAt" timestamp,
	"finishedAt" timestamp,
	"expiredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tattoo_request_requestCode_unique" UNIQUE("requestCode"),
	CONSTRAINT "tattoo_request_trackingToken_unique" UNIQUE("trackingToken")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_image" ADD CONSTRAINT "portfolio_image_itemId_portfolio_item_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."portfolio_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_image" ADD CONSTRAINT "reference_image_requestId_tattoo_request_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."tattoo_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_image_itemId_r2Key_idx" ON "portfolio_image" USING btree ("itemId","r2Key");--> statement-breakpoint
CREATE INDEX "portfolio_image_itemId_sortOrder_idx" ON "portfolio_image" USING btree ("itemId","sortOrder");--> statement-breakpoint
CREATE INDEX "portfolio_item_isPublished_sortOrder_idx" ON "portfolio_item" USING btree ("isPublished","sortOrder");--> statement-breakpoint
CREATE INDEX "portfolio_item_style_idx" ON "portfolio_item" USING btree ("style");--> statement-breakpoint
CREATE UNIQUE INDEX "reference_image_requestId_r2Key_idx" ON "reference_image" USING btree ("requestId","r2Key");--> statement-breakpoint
CREATE INDEX "reference_image_requestId_createdAt_idx" ON "reference_image" USING btree ("requestId","createdAt");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "tattoo_request_status_createdAt_idx" ON "tattoo_request" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "tattoo_request_sentAt_idx" ON "tattoo_request" USING btree ("sentAt");--> statement-breakpoint
CREATE INDEX "tattoo_request_requestCode_idx" ON "tattoo_request" USING btree ("requestCode");--> statement-breakpoint
CREATE INDEX "tattoo_request_fullName_idx" ON "tattoo_request" USING btree ("fullName");--> statement-breakpoint
CREATE INDEX "tattoo_request_whatsappE164_idx" ON "tattoo_request" USING btree ("whatsappE164");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");