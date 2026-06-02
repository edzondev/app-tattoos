import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin-allowlist'
import { getServerSession } from '@/lib/session'
import MagicLinkForm from '@/modules/login/components/magic-link-form'

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const [session, { callbackUrl }] = await Promise.all([
    getServerSession(),
    searchParams,
  ])

  if (session?.user && isAdminEmail(session.user.email)) {
    redirect(callbackUrl ?? '/admin')
  }

  const safeCallbackUrl = callbackUrl?.startsWith('/') ? callbackUrl : '/admin'

  return (
    <section className="py-20 md:py-60 min-h-full flex items-center justify-center px-4">
      <MagicLinkForm callbackUrl={safeCallbackUrl} />
    </section>
  )
}
