import { and, desc, eq, ilike } from 'drizzle-orm'
import { Image as ImageIcon, LayoutDashboard } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { isAdminEmail } from '@/lib/admin-allowlist'
import { db } from '@/lib/db'
import { tattooRequest } from '@/lib/db/schema'
import { getServerSession } from '@/lib/session'
import { columns } from '@/modules/admin/columns'
import AdminFilters from '@/modules/admin/components/admin-filter'
import PortfolioTab from '@/modules/admin/components/portfolio-tab'
import { DataTable } from '@/modules/core/components/ui/data-table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/modules/core/components/ui/tabs'
import { adminFiltersSchema } from '@/modules/schemas/admin-filters.schema'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminPage({ searchParams }: Props) {
  const session = await getServerSession()

  if (!session?.user || !isAdminEmail(session.user.email)) {
    redirect('/admin/login')
  }

  const rawParams = await searchParams
  const filters = adminFiltersSchema.parse({
    search: rawParams.search ?? '',
    status: rawParams.status ?? '',
  })

  const conditions = []
  if (filters.search) {
    conditions.push(ilike(tattooRequest.fullName, `%${filters.search}%`))
  }
  if (filters.status) {
    conditions.push(eq(tattooRequest.status, filters.status))
  }

  const data = await db.query.tattooRequest.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    columns: {
      requestCode: true,
      fullName: true,
      style: true,
      status: true,
      sentAt: true,
      createdAt: true,
    },
    orderBy: desc(tattooRequest.createdAt),
  })

  return (
    <Tabs defaultValue="leads">
      <TabsList className="bg-card border border-border/50 mb-6">
        <TabsTrigger
          value="leads"
          className="font-body gap-2 data-[state=active]:text-primary"
        >
          <LayoutDashboard size={16} /> Leads
        </TabsTrigger>
        <TabsTrigger
          value="portfolio"
          className="font-body gap-2 data-[state=active]:text-primary"
        >
          <ImageIcon size={16} /> Portafolio
        </TabsTrigger>
      </TabsList>
      <TabsContent value="leads" className="space-y-6">
        <Suspense fallback={<>Loading...</>}>
          <AdminFilters />
        </Suspense>

        <div>
          <DataTable columns={columns} data={data} />
        </div>
      </TabsContent>
      <TabsContent value="portfolio">
        <PortfolioTab />
      </TabsContent>
    </Tabs>
  )
}
