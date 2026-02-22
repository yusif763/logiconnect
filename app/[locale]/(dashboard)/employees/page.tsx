'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { EmployeeCard } from '@/components/employees/EmployeeCard'
import { AddEmployeeDialog } from '@/components/employees/AddEmployeeDialog'
import { Loader2, Users, ShieldOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EmployeesPage() {
  const { data: session } = useSession()
  const t = useTranslations('employees')
  const params = useParams()
  const locale = params.locale as string

  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isCompanyAdmin = session?.user.isCompanyAdmin

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchEmployees()
  }, [session])

  if (!session) return null

  if (!isCompanyAdmin && session.user.role !== 'ADMIN') {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <Alert className="border-red-200 bg-red-50">
          <ShieldOff className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">{t('notAdmin')}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {employees.length} {employees.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        {isCompanyAdmin && (
          <AddEmployeeDialog onSuccess={fetchEmployees} />
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="p-4 bg-slate-50 rounded-full inline-flex mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">{t('noEmployees')}</p>
          {isCompanyAdmin && (
            <p className="text-slate-400 text-sm mt-1">Add your first employee to get started</p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
