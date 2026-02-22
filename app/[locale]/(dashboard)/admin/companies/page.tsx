'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminCompaniesPage() {
  const { data: session } = useSession()
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: 'all', verified: 'all' })
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchCompanies = async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (filter.type !== 'all') p.set('type', filter.type)
    if (filter.verified !== 'all') p.set('verified', filter.verified)
    const res = await fetch(`/api/companies?${p}`)
    setCompanies(await res.json())
    setLoading(false)
  }

  useEffect(() => { if (session?.user.role === 'ADMIN') fetchCompanies() }, [session, filter])

  const updateCompany = async (id: string, data: any) => {
    setUpdating(id)
    await fetch(`/api/companies/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchCompanies()
    setUpdating(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('companies')}</h1>
        <Button variant="outline" size="sm" onClick={fetchCompanies}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <Select value={filter.type} onValueChange={(v) => setFilter(f => ({ ...f, type: v }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="SUPPLIER">{t('companyType.SUPPLIER')}</SelectItem>
                <SelectItem value="LOGISTICS">{t('companyType.LOGISTICS')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter.verified} onValueChange={(v) => setFilter(f => ({ ...f, verified: v }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">{t('verified')}</SelectItem>
                <SelectItem value="false">{t('pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map(company => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {t(`companyType.${company.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{company.email}</TableCell>
                    <TableCell>
                      {company.isVerified ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" /> {t('verified')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                          <XCircle className="h-4 w-4" /> {t('pending')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{company._count?.users}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(company.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {!company.isVerified ? (
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => updateCompany(company.id, { verified: true })}
                            disabled={updating === company.id}
                          >
                            {updating === company.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t('verify')}
                          </Button>
                        ) : null}
                        {company.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-600 border-red-200"
                            onClick={() => updateCompany(company.id, { active: false })}
                            disabled={updating === company.id}
                          >
                            {t('suspend')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-green-600 border-green-200"
                            onClick={() => updateCompany(company.id, { active: true })}
                            disabled={updating === company.id}
                          >
                            {t('activate')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
