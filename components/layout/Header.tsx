'use client'

import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut, Globe, Menu } from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
    companyName: string
    isVerified: boolean
  }
  locale: string
  onMobileMenuToggle?: () => void
}

export function Header({ user, locale, onMobileMenuToggle }: HeaderProps) {
  const t = useTranslations('nav')
  const router = useRouter()
  const pathname = usePathname()

  const toggleLocale = () => {
    const newLocale = locale === 'az' ? 'en' : 'az'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    SUPPLIER_EMPLOYEE: 'bg-blue-100 text-blue-700',
    LOGISTICS_EMPLOYEE: 'bg-green-100 text-green-700',
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <Button
          variant="outline"
          size="sm"
          onClick={toggleLocale}
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          {locale === 'az' ? 'EN' : 'AZ'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user.companyName}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-slate-500 font-normal">{user.email}</p>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role] || ''}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
