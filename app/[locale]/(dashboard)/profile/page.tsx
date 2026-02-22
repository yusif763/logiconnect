'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Building2, MapPin, Shield, CheckCircle, Clock } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const t = useTranslations('profile')

  if (!session) return null

  const initials = session.user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('personalInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{session.user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm text-slate-600">{session.user.email}</span>
              </div>
              <div className="mt-2">
                <Badge className="text-xs bg-blue-100 text-blue-700">
                  <Shield className="h-3 w-3 mr-1" />
                  {session.user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('companyInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">{session.user.companyName}</p>
                <p className="text-xs text-slate-500">{session.user.companyType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session.user.isVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Verified Company</span>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-medium">Awaiting Verification</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
