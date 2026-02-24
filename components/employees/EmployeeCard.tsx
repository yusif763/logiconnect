'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, FileText, BarChart3, Shield, User } from 'lucide-react'

interface EmployeeCardProps {
  employee: {
    id: string
    name: string
    email: string
    role: string
    isCompanyAdmin: boolean
    companyType: string
    createdAt: string
    totalOffers: number
    winRate: number
    totalAnnouncements: number
    acceptedOffers: number
  }
  locale: string
}

export function EmployeeCard({ employee, locale }: EmployeeCardProps) {
  const t = useTranslations('employees')
  const isLogistics = employee.companyType === 'LOGISTICS'

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 truncate w-full">{employee.name}</h3>
              <Badge
                variant={employee.isCompanyAdmin ? 'default' : 'secondary'}
                className={employee.isCompanyAdmin ? 'bg-blue-600 text-white text-xs' : 'text-xs'}
              >
                {employee.isCompanyAdmin ? (
                  <><Shield className="h-3 w-3 mr-1" />{t('companyAdmin')}</>
                ) : (
                  <><User className="h-3 w-3 mr-1" />{t('employee')}</>
                )}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{employee.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('memberSince')} {format(new Date(employee.createdAt), 'MMM yyyy')}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {isLogistics ? (
            <>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="text-xs">{t('totalOffers')}</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{employee.totalOffers}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs">{t('winRate')}</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{employee.winRate}%</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="text-xs">{t('totalAnnouncements')}</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{employee.totalAnnouncements}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs">{t('acceptanceRate')}</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  {employee.totalAnnouncements > 0
                    ? Math.round((employee.acceptedOffers / employee.totalAnnouncements) * 100)
                    : 0}%
                </p>
              </div>
            </>
          )}
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full mt-3 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Link href={`/${locale}/employees/${employee.id}`}>
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            {t('viewPerformance')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
