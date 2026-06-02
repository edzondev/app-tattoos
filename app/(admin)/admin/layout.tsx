import { headers } from 'next/headers'
import type { PropsWithChildren } from 'react'
import { auth } from '@/lib/auth'
import LogoutButton from '@/modules/admin/components/logout-button'
import HeaderText from '@/modules/core/components/shared/header-text'

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const showLogout = !!session?.user

  return (
    <section className="min-h-dvh w-full">
      <div className="container mx-auto">
        <div className="p-6 md:p-10">
          <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <HeaderText
                title="Panel"
                highlightedText="Admin"
                description="Gestiona leads y portafolio"
                className="mb-0"
              />
              {showLogout && <LogoutButton />}
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
