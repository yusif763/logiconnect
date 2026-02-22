'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const t = useTranslations('admin')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      fetch('/api/users')
        .then(r => r.json())
        .then(d => { setUsers(d); setLoading(false) })
    }
  }, [session])

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    SUPPLIER_EMPLOYEE: 'bg-blue-100 text-blue-700',
    LOGISTICS_EMPLOYEE: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('users')}</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Company Type</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${roleColors[user.role] || ''}`}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.company?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {t(`companyType.${user.company?.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
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
