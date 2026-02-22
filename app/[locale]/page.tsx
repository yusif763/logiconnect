import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight, CheckCircle, Truck, Plane, Ship, Train } from 'lucide-react'

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('landing')
  const ta = await getTranslations('auth')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-7 w-7 text-blue-400" />
            <span className="font-bold text-xl text-white">LogiConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`}>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                {ta('login')}
              </Button>
            </Link>
            <Link href={`/${locale}/register/supplier`}>
              <Button className="bg-blue-500 hover:bg-blue-400">
                {t('getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-blue-300 text-sm font-medium">B2B Platform</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          {t('hero')}
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          {t('heroSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${locale}/register/supplier`}>
            <Button size="lg" className="bg-blue-500 hover:bg-blue-400 w-full sm:w-auto">
              {ta('registerSupplier')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href={`/${locale}/register/logistics`}>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
              {ta('registerLogistics')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Transport icons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Plane, label: 'Air Freight', color: 'text-blue-400' },
            { icon: Ship, label: 'Sea Freight', color: 'text-cyan-400' },
            { icon: Train, label: 'Rail Freight', color: 'text-green-400' },
            { icon: Truck, label: 'Road Freight', color: 'text-yellow-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <Icon className={`h-10 w-10 ${color} mx-auto mb-3`} />
              <p className="text-white font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{t('forSuppliers')}</h2>
            <ul className="space-y-4">
              {[t('supplierFeature1'), t('supplierFeature2'), t('supplierFeature3')].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/register/supplier`} className="mt-8 block">
              <Button className="w-full bg-blue-500 hover:bg-blue-400">
                {ta('registerSupplier')}
              </Button>
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{t('forLogistics')}</h2>
            <ul className="space-y-4">
              {[t('logisticsFeature1'), t('logisticsFeature2'), t('logisticsFeature3')].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/register/logistics`} className="mt-8 block">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                {ta('registerLogistics')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        © 2024 LogiConnect. All rights reserved.
      </footer>
    </div>
  )
}
