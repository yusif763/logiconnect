import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Package, ArrowRight, CheckCircle, Truck, Plane, Ship, Train,
  TrendingUp, Users, BarChart3, Globe, Shield, Zap,
  Target, Award, Clock, DollarSign, Eye, FileText,
  UserPlus, Building2, PlusCircle, ListFilter, Scale,
  FileBarChart, PieChart, LineChart, Calendar, MapPin,
  Edit3, MessageSquare, Download
} from 'lucide-react'

export default async function PresentationPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('presentation')
  const ta = await getTranslations('auth')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Package className="h-7 w-7 text-blue-400" />
            <span className="font-bold text-xl text-white">LogiConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`}>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                {ta('login')}
              </Button>
            </Link>
            <Link href={`/${locale}/register/supplier`}>
              <Button className="bg-blue-500 hover:bg-blue-400">
                {t('startNow')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Impactful Opening */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
          <Zap className="h-4 w-4 text-blue-300" />
          <span className="text-blue-300 text-sm font-medium">{t('badge')}</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto mb-10">
          {t('heroSubtitle')}
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
          {[
            { icon: TrendingUp, value: '20-40%', label: t('stat1') },
            { icon: Users, value: '100+', label: t('stat2') },
            { icon: Globe, value: '4', label: t('stat3') },
            { icon: Zap, value: '24/7', label: t('stat4') },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <Icon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${locale}/register/supplier`}>
            <Button size="lg" className="bg-blue-500 hover:bg-blue-400 w-full sm:w-auto text-lg px-8">
              {ta('registerSupplier')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href={`/${locale}/register/logistics`}>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full bg-[transparent] sm:w-auto text-lg px-8">
              {ta('registerLogistics')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{t('problemTitle')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-4">{t('problemSupplier')}</h3>
              <ul className="space-y-3">
                {[t('problemSupplier1'), t('problemSupplier2'), t('problemSupplier3'), t('problemSupplier4')].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-400 mb-4">{t('problemLogistics')}</h3>
              <ul className="space-y-3">
                {[t('problemLogistics1'), t('problemLogistics2'), t('problemLogistics3'), t('problemLogistics4')].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Solution - LogiConnect Platform */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('solutionTitle')}</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">{t('solutionSubtitle')}</p>
        </div>

        {/* Transport Types */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Plane, label: t('transportAir'), color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
            { icon: Ship, label: t('transportSea'), color: 'text-cyan-400', bgColor: 'bg-cyan-400/10' },
            { icon: Train, label: t('transportRail'), color: 'text-green-400', bgColor: 'bg-green-400/10' },
            { icon: Truck, label: t('transportRoad'), color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
          ].map(({ icon: Icon, label, color, bgColor }) => (
            <div key={label} className={`${bgColor} border border-white/10 rounded-xl p-6 text-center hover:scale-105 transition-transform`}>
              <Icon className={`h-12 w-12 ${color} mx-auto mb-3`} />
              <p className="text-white font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Suppliers - Detailed Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-10 w-10 text-blue-400" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{t('supplierTitle')}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, title: t('supplierFeature1Title'), desc: t('supplierFeature1Desc') },
              { icon: Clock, title: t('supplierFeature2Title'), desc: t('supplierFeature2Desc') },
              { icon: Eye, title: t('supplierFeature3Title'), desc: t('supplierFeature3Desc') },
              { icon: BarChart3, title: t('supplierFeature4Title'), desc: t('supplierFeature4Desc') },
              { icon: Users, title: t('supplierFeature5Title'), desc: t('supplierFeature5Desc') },
              { icon: Shield, title: t('supplierFeature6Title'), desc: t('supplierFeature6Desc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <Icon className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-300 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href={`/${locale}/register/supplier`}>
              <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-lg px-8">
                {t('supplierCTA')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Logistics - Detailed Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Truck className="h-10 w-10 text-green-400" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{t('logisticsTitle')}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: t('logisticsFeature1Title'), desc: t('logisticsFeature1Desc') },
              { icon: FileText, title: t('logisticsFeature2Title'), desc: t('logisticsFeature2Desc') },
              { icon: TrendingUp, title: t('logisticsFeature3Title'), desc: t('logisticsFeature3Desc') },
              { icon: BarChart3, title: t('logisticsFeature4Title'), desc: t('logisticsFeature4Desc') },
              { icon: Zap, title: t('logisticsFeature5Title'), desc: t('logisticsFeature5Desc') },
              { icon: Award, title: t('logisticsFeature6Title'), desc: t('logisticsFeature6Desc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <Icon className="h-8 w-8 text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-300 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href={`/${locale}/register/logistics`}>
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-lg px-8">
                {t('logisticsCTA')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('howItWorksTitle')}</h2>
          <p className="text-xl text-slate-300">{t('howItWorksSubtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: t('step1Title'), desc: t('step1Desc'), icon: FileText },
            { step: '2', title: t('step2Title'), desc: t('step2Desc'), icon: Users },
            { step: '3', title: t('step3Title'), desc: t('step3Desc'), icon: CheckCircle },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="relative">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white text-2xl font-bold mb-4">
                  {step}
                </div>
                <Icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-300">{desc}</p>
              </div>
              {step !== '3' && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-blue-400" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Key Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 md:p-12">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">{t('benefitsTitle')}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: t('benefit1Title'), desc: t('benefit1Desc') },
              { icon: Globe, title: t('benefit2Title'), desc: t('benefit2Desc') },
              { icon: Zap, title: t('benefit3Title'), desc: t('benefit3Desc') },
              { icon: BarChart3, title: t('benefit4Title'), desc: t('benefit4Desc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-slate-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Walkthrough */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('featuresWalkthroughTitle')}</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">{t('featuresWalkthroughSubtitle')}</p>
        </div>

        {/* Feature 1: User & Company Management */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-10 w-10 text-indigo-400" />
              <h3 className="text-3xl font-bold text-white">{t('feature1Title')}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Description */}
              <div className="space-y-4">
                <p className="text-slate-300 text-lg">{t('feature1Desc')}</p>
                <ul className="space-y-3">
                  {[t('feature1Point1'), t('feature1Point2'), t('feature1Point3'), t('feature1Point4')].map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-indigo-400 mt-1 shrink-0" />
                      <span className="text-slate-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Mock Interface */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold">{t('feature1MockTitle')}</h4>
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-400 text-sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('feature1AddUser')}
                    </Button>
                  </div>

                  {/* Mock User Cards */}
                  {[
                    { name: 'Əli Məmmədov', role: t('feature1RoleAdmin'), email: 'ali@company.az' },
                    { name: 'Leyla İsmayılova', role: t('feature1RoleEmployee'), email: 'leyla@company.az' },
                    { name: 'Rəşad Həsənov', role: t('feature1RoleEmployee'), email: 'rashad@company.az' },
                  ].map((user, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-slate-400 text-sm">{user.email}</div>
                          </div>
                        </div>
                        <div className="text-indigo-400 text-sm">{user.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Announcement Creation */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <PlusCircle className="h-10 w-10 text-blue-400" />
              <h3 className="text-3xl font-bold text-white">{t('feature2Title')}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Mock Form */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">{t('feature2TitleLabel')}</label>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-400">
                      İstanbul → Bakı yük daşınması
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">{t('feature2Origin')}</label>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-400">İstanbul, TR</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">{t('feature2Destination')}</label>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-400">Bakı, AZ</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">{t('feature2Weight')}</label>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-slate-400">
                        2500 kg
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">{t('feature2Deadline')}</label>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-400">15 Mart 2024</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-500 hover:bg-blue-400">
                    {t('feature2CreateButton')}
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="text-slate-300 text-lg">{t('feature2Desc')}</p>
                <ul className="space-y-3">
                  {[t('feature2Point1'), t('feature2Point2'), t('feature2Point3'), t('feature2Point4')].map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                      <span className="text-slate-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Offer Comparison */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="h-10 w-10 text-green-400" />
              <h3 className="text-3xl font-bold text-white">{t('feature3Title')}</h3>
            </div>

            <div className="space-y-6">
              <p className="text-slate-300 text-lg">{t('feature3Desc')}</p>

              {/* Mock Offers Comparison Table */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="bg-white/5 border-b border-white/10 px-6 py-4">
                  <div className="grid grid-cols-5 gap-4 text-white font-bold text-sm">
                    <div>{t('feature3Company')}</div>
                    <div>{t('feature3Transport')}</div>
                    <div>{t('feature3Price')}</div>
                    <div>{t('feature3Days')}</div>
                    <div>{t('feature3Action')}</div>
                  </div>
                </div>

                {/* Table Rows */}
                {[
                  { company: 'Swift Cargo', transport: 'Hava', price: '2,500 AZN', days: '3-5', status: 'best', icon: Plane, color: 'blue' },
                  { company: 'Express Logistics', transport: 'Dəmiryol', price: '1,800 AZN', days: '7-10', status: 'cheapest', icon: Train, color: 'green' },
                  { company: 'Global Transport', transport: 'Dəniz', price: '1,200 AZN', days: '15-20', status: 'slow', icon: Ship, color: 'cyan' },
                  { company: 'FastTrack LLC', transport: 'Avtomobil', price: '2,200 AZN', days: '5-7', status: 'balanced', icon: Truck, color: 'yellow' },
                ].map((offer, i) => (
                  <div key={i} className={`border-b border-white/10 px-6 py-4 hover:bg-white/5 transition-colors ${offer.status === 'best' ? 'bg-green-500/5' : ''}`}>
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-white">{offer.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <offer.icon className={`h-5 w-5 text-${offer.color}-400`} />
                        <span className="text-slate-300">{offer.transport}</span>
                      </div>
                      <div className="text-white font-bold">{offer.price}</div>
                      <div className="text-slate-300">{offer.days} {t('feature3DaysLabel')}</div>
                      <div>
                        {offer.status === 'best' && (
                          <div className="inline-flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 text-green-400 text-xs">
                            <CheckCircle className="h-3 w-3" />
                            {t('feature3BestOffer')}
                          </div>
                        )}
                        {offer.status === 'cheapest' && (
                          <div className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 text-blue-400 text-xs">
                            <DollarSign className="h-3 w-3" />
                            {t('feature3Cheapest')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: ListFilter, title: t('feature3Point1') },
                  { icon: Scale, title: t('feature3Point2') },
                  { icon: MessageSquare, title: t('feature3Point3') },
                ].map((point, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-3">
                    <point.icon className="h-6 w-6 text-green-400 shrink-0 mt-1" />
                    <span className="text-slate-300">{point.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Reports & Analytics */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <FileBarChart className="h-10 w-10 text-purple-400" />
              <h3 className="text-3xl font-bold text-white">{t('feature4Title')}</h3>
            </div>

            <div className="space-y-6">
              <p className="text-slate-300 text-lg">{t('feature4Desc')}</p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Charts Section */}
                <div className="space-y-4">
                  {/* Mock Chart 1 */}
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-bold">{t('feature4Chart1')}</h4>
                      <LineChart className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                      {[
                        { month: 'Yanvar', value: 85, color: 'bg-purple-500' },
                        { month: 'Fevral', value: 92, color: 'bg-purple-400' },
                        { month: 'Mart', value: 78, color: 'bg-purple-600' },
                      ].map((data, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400">{data.month}</span>
                            <span className="text-white font-bold">{data.value}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className={`${data.color} h-2 rounded-full`} style={{ width: `${data.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Chart 2 */}
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-bold">{t('feature4Chart2')}</h4>
                      <PieChart className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Hava', value: '35%', color: 'bg-blue-500' },
                        { label: 'Dəniz', value: '28%', color: 'bg-cyan-500' },
                        { label: 'Dəmiryol', value: '22%', color: 'bg-green-500' },
                        { label: 'Avtomobil', value: '15%', color: 'bg-yellow-500' },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3">
                          <div className={`w-3 h-3 rounded-full ${item.color} mb-2`} />
                          <div className="text-white font-bold">{item.value}</div>
                          <div className="text-slate-400 text-sm">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reports Types */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-lg mb-4">{t('feature4ReportsTitle')}</h4>
                  {[
                    { icon: BarChart3, title: t('feature4Report1'), desc: t('feature4Report1Desc') },
                    { icon: TrendingUp, title: t('feature4Report2'), desc: t('feature4Report2Desc') },
                    { icon: DollarSign, title: t('feature4Report3'), desc: t('feature4Report3Desc') },
                    { icon: Users, title: t('feature4Report4'), desc: t('feature4Report4Desc') },
                    { icon: Download, title: t('feature4Report5'), desc: t('feature4Report5Desc') },
                  ].map((report, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                          <report.icon className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-white font-bold mb-1">{report.title}</div>
                          <div className="text-slate-400 text-sm">{report.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">{t('ctaTitle')}</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{t('ctaSubtitle')}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/register/supplier`}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 w-full sm:w-auto text-lg px-8">
                {t('ctaSupplier')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/register/logistics`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto text-lg px-8 bg-[transparent]">
                {t('ctaLogistics')}
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-blue-100 text-sm">
            {t('ctaNote')}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-lg text-white">LogiConnect</span>
            </div>
            <div className="text-slate-500 text-sm text-center">
              © 2024 LogiConnect. {t('footerRights')}
            </div>
            <div className="flex gap-4">
              <Link href={`/${locale}/login`} className="text-slate-400 hover:text-white text-sm">
                {ta('login')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}