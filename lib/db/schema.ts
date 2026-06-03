import { createId } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const tattooStyleEnum = pgEnum('TattooStyle', [
  'COVER_UP',
  'RELIGIOUS',
  'PERSONALIZED',
  'DOTWORK',
  'SURREALISM',
  'WATERCOLOR',
  'GEOMETRIC',
])

export const tattooSizeEnum = pgEnum('TattooSize', [
  'SMALL',
  'MEDIUM',
  'LARGE',
  'OTHER',
])

export const colorModeEnum = pgEnum('ColorMode', ['BLACK_AND_GREY', 'COLOR'])

export const requestStatusEnum = pgEnum('RequestStatus', [
  'SENT',
  'QUOTED',
  'APPOINTMENT_CONFIRMED',
  'FINISHED',
  'EXPIRED',
])

// ---------------------------------------------------------------------------
// Auth tables (better-auth)
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('session_userId_idx').on(t.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index('account_userId_idx').on(t.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
)

// ---------------------------------------------------------------------------
// App tables
// ---------------------------------------------------------------------------

export const tattooRequest = pgTable(
  'tattoo_request',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    requestCode: text('requestCode').unique(),
    trackingToken: text('trackingToken')
      .notNull()
      .unique()
      .$defaultFn(() => createId()),
    status: requestStatusEnum('status'),
    title: text('title'),
    style: tattooStyleEnum('style').notNull().default('COVER_UP'),
    styleOther: text('styleOther'),
    bodyZone: text('bodyZone').notNull(),
    size: tattooSizeEnum('size').notNull().default('OTHER'),
    sizeNotes: text('sizeNotes'),
    colorMode: colorModeEnum('colorMode').notNull().default('BLACK_AND_GREY'),
    detailLevel: integer('detailLevel').notNull().default(3),
    generationCount: integer('generationCount').notNull().default(0),
    specialInstructions: text('specialInstructions'),
    finalPrompt: text('finalPrompt'),
    selectedImageR2Key: text('selectedImageR2Key'),
    selectedImageWatermarkedR2Key: text('selectedImageWatermarkedR2Key'),
    selectedImagePublicUrl: text('selectedImagePublicUrl'),
    selectedImageMimeType: text('selectedImageMimeType'),
    selectedImageSizeBytes: integer('selectedImageSizeBytes'),
    fullName: text('fullName'),
    whatsappE164: text('whatsappE164'),
    district: text('district'),
    availability: text('availability'),
    extraComments: text('extraComments'),
    currency: text('currency').notNull().default('PEN'),
    priceCents: integer('priceCents'),
    depositCents: integer('depositCents'),
    depositDueAt: timestamp('depositDueAt'),
    mpPreferenceId: text('mpPreferenceId'),
    mpPaymentId: text('mpPaymentId'),
    paymentStatus: text('paymentStatus'),
    sentAt: timestamp('sentAt'),
    quotedAt: timestamp('quotedAt'),
    depositConfirmedAt: timestamp('depositConfirmedAt'),
    appointmentAt: timestamp('appointmentAt'),
    finishedAt: timestamp('finishedAt'),
    expiredAt: timestamp('expiredAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index('tattoo_request_status_createdAt_idx').on(t.status, t.createdAt),
    index('tattoo_request_sentAt_idx').on(t.sentAt),
    index('tattoo_request_requestCode_idx').on(t.requestCode),
    index('tattoo_request_fullName_idx').on(t.fullName),
    index('tattoo_request_whatsappE164_idx').on(t.whatsappE164),
    uniqueIndex('tattoo_request_whatsapp_active_idx')
      .on(t.whatsappE164)
      .where(sql`status IS NULL OR status NOT IN ('FINISHED', 'EXPIRED')`),
  ],
)

export const referenceImage = pgTable(
  'reference_image',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    requestId: text('requestId')
      .notNull()
      .references(() => tattooRequest.id, { onDelete: 'cascade' }),
    r2Key: text('r2Key').notNull(),
    publicUrl: text('publicUrl'),
    mimeType: text('mimeType'),
    sizeBytes: integer('sizeBytes'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('reference_image_requestId_r2Key_idx').on(t.requestId, t.r2Key),
    index('reference_image_requestId_createdAt_idx').on(
      t.requestId,
      t.createdAt,
    ),
  ],
)

export const portfolioItem = pgTable(
  'portfolio_item',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(),
    description: text('description'),
    style: tattooStyleEnum('style').notNull().default('COVER_UP'),
    bodyZone: text('bodyZone'),
    colorMode: colorModeEnum('colorMode').notNull().default('BLACK_AND_GREY'),
    isPublished: boolean('isPublished').notNull().default(true),
    sortOrder: integer('sortOrder').notNull().default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index('portfolio_item_isPublished_sortOrder_idx').on(
      t.isPublished,
      t.sortOrder,
    ),
    index('portfolio_item_style_idx').on(t.style),
  ],
)

export const portfolioImage = pgTable(
  'portfolio_image',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    itemId: text('itemId')
      .notNull()
      .references(() => portfolioItem.id, { onDelete: 'cascade' }),
    r2Key: text('r2Key').notNull(),
    publicUrl: text('publicUrl'),
    mimeType: text('mimeType'),
    sizeBytes: integer('sizeBytes'),
    sortOrder: integer('sortOrder').notNull().default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('portfolio_image_itemId_r2Key_idx').on(t.itemId, t.r2Key),
    index('portfolio_image_itemId_sortOrder_idx').on(t.itemId, t.sortOrder),
  ],
)

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

export const rateLimit = pgTable(
  'rate_limit',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    ip: text('ip').notNull(),
    attempts: integer('attempts').notNull().default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [unique('rate_limit_ip_idx').on(t.ip)],
)

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const tattooRequestRelations = relations(tattooRequest, ({ many }) => ({
  referenceImages: many(referenceImage),
}))

export const referenceImageRelations = relations(referenceImage, ({ one }) => ({
  request: one(tattooRequest, {
    fields: [referenceImage.requestId],
    references: [tattooRequest.id],
  }),
}))

export const portfolioItemRelations = relations(portfolioItem, ({ many }) => ({
  images: many(portfolioImage),
}))

export const portfolioImageRelations = relations(portfolioImage, ({ one }) => ({
  item: one(portfolioItem, {
    fields: [portfolioImage.itemId],
    references: [portfolioItem.id],
  }),
}))
