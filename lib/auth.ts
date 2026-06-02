import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { requiredEnv } from '@/lib/env'
import { db } from './db'

const resend = new Resend(requiredEnv('RESEND_API_KEY'))

async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string
  token: string
  url: string
}) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(url)
      return
    }

    await resend.emails.send({
      from: 'noreply@mail.inkyra.app',
      to: email,
      subject: 'Tu enlace de acceso',
      html: `<p>Haz clic <a href="${url}">aquí</a> para ingresar al panel.</p>`,
    })
  } catch (e) {
    console.error('[auth] sendMagicLinkEmail error', e)
    throw e
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  plugins: [
    magicLink({
      expiresIn: 600,
      disableSignUp: false,
      sendMagicLink: sendMagicLinkEmail,
    }),
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
