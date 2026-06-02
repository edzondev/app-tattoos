import { headers } from 'next/headers'
import { auth } from './auth'

export async function getServerSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}
