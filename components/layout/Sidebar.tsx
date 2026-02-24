'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  BarChart3,
  User,
  Building2,
  Users,
  Shield,
  Package,
  Truck,
} from 'lucide-react'

interface SidebarProps {
  role: string
  locale: string
  isCompanyAdmin?: boolean
}

export function Sidebar({ role, locale, isCompanyAdmin = false }: SidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(`/${locale}`, '') || '/'
    return cleanPath === href || cleanPath.startsWith(href + '/')
  }

  const navItems = [
    {
      href: '/dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SUPPLIER_EMPLOYEE', 'LOGISTICS_EMPLOYEE'],
    },
    {
      href: '/announcements',
      label: t('announcements'),
      icon: Megaphone,
      roles: ['ADMIN', 'SUPPLIER_EMPLOYEE', 'LOGISTICS_EMPLOYEE'],
    },
    {
      href: '/offers',
      label: t('offers'),
      icon: FileText,
      roles: ['ADMIN', 'SUPPLIER_EMPLOYEE', 'LOGISTICS_EMPLOYEE'],
    },
    {
      href: '/shipments',
      label: t('shipments'),
      icon: Truck,
      roles: ['SUPPLIER_EMPLOYEE', 'LOGISTICS_EMPLOYEE'],
    },
    {
      href: '/reports',
      label: t('reports'),
      icon: BarChart3,
      roles: ['ADMIN', 'SUPPLIER_EMPLOYEE', 'LOGISTICS_EMPLOYEE'],
      requiresCompanyAdmin: false,
    },
    {
      href: '/employees',
      label: t('employees'),
      icon: Users,
      roles: ['SUPPLIER_EMPLOYEE', 'LOGISTICS_EMPLOYEE'],
      requiresCompanyAdmin: true,
    },
    {
      href: '/profile',
      label: t('profile'),
      icon: User,
      roles: ['ADMIN', 'SUPPLIER_EMPLOYEE', 'LOGISTICS_EMPLOYEE'],
      requiresCompanyAdmin: false,
    },
  ]

  const adminItems = [
    {
      href: '/admin',
      label: t('admin'),
      icon: Shield,
      roles: ['ADMIN'],
    },
    {
      href: '/admin/companies',
      label: t('companies'),
      icon: Building2,
      roles: ['ADMIN'],
    },
    {
      href: '/admin/users',
      label: t('users'),
      icon: Users,
      roles: ['ADMIN'],
    },
  ]

  const filteredNav = navItems.filter(item =>
    item.roles.includes(role) && (!item.requiresCompanyAdmin || isCompanyAdmin)
  )
  const filteredAdmin = adminItems.filter(item => item.roles.includes(role))

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 custom-scrollbar overflow-y-auto">
      <div className="flex items-center gap-2 p-6 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-blue-700">
        <Package className="h-6 w-6 text-white" />
        <span className="font-bold text-lg text-white">LogiConnect</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 animate-slide-up">
        {filteredNav.map((item, index) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover-lift',
              isActive(item.href)
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        ))}

        {filteredAdmin.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
                Administration
              </p>
            </div>
            {filteredAdmin.map((item, index) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover-lift',
                  isActive(item.href)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
                style={{ animationDelay: `${(filteredNav.length + index) * 50}ms` }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </div>
  )
}
