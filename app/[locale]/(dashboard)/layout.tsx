'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    }
  }, [status, router, locale])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shadow-xl">
        <Sidebar role={session.user.role} locale={locale} isCompanyAdmin={session.user.isCompanyAdmin ?? false} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar role={session.user.role} locale={locale} isCompanyAdmin={session.user.isCompanyAdmin ?? false} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            companyName: session.user.companyName,
            isVerified: session.user.isVerified,
          }}
          locale={locale}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {!session.user.isVerified && (
            <div className="px-4 pt-4 lg:px-6 animate-slide-down">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {t('awaitingVerification')}
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="p-4 lg:p-6 pb-20 animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
