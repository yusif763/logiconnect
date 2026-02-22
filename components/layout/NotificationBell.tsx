'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useParams, useRouter } from 'next/navigation'

const TYPE_ICON: Record<string, string> = {
  NEW_OFFER: '📦',
  OFFER_ACCEPTED: '✅',
  OFFER_REJECTED: '❌',
  NEW_COMMENT: '💬',
}

function getNotifHref(type: string, relatedId: string | null, locale: string): string | null {
  if (!relatedId) return null
  if (type === 'NEW_OFFER') return `/${locale}/announcements/${relatedId}`
  if (type === 'OFFER_ACCEPTED' || type === 'OFFER_REJECTED' || type === 'NEW_COMMENT') {
    return `/${locale}/offers/${relatedId}`
  }
  return null
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) ?? 'en'

  const fetchInitial = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchInitial()

    const worker = new Worker('/notif-worker.js')
    workerRef.current = worker

    worker.onmessage = (e) => {
      if (e.data.type === 'new') {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n: any) => n.id))
          const fresh = e.data.notifications.filter((n: any) => !existingIds.has(n.id))
          return [...fresh, ...prev].slice(0, 30)
        })
        setUnreadCount(e.data.unreadCount ?? 0)

        // Browser Notification API
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            e.data.notifications.forEach((n: any) => {
              new Notification(n.title, { body: n.body, icon: '/favicon.ico' })
            })
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission()
          }
        }
      }
    }

    worker.postMessage('start')

    // Request permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      worker.postMessage('stop')
      worker.terminate()
    }
  }, [fetchInitial])

  const markAllRead = async () => {
    await fetch('/api/notifications/read', { method: 'PATCH', body: JSON.stringify({}), headers: { 'Content-Type': 'application/json' } })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const handleOpen = (val: boolean) => {
    setOpen(val)
    if (val && unreadCount > 0) markAllRead()
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No notifications yet
          </div>
        ) : (
          <div>
            {notifications.map((n) => {
              const href = getNotifHref(n.type, n.relatedId, locale)
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (href) {
                      setOpen(false)
                      router.push(href)
                    }
                  }}
                  className={cn(
                    'px-4 py-3 border-b last:border-0 text-sm transition-colors',
                    !n.isRead && 'bg-blue-50/60',
                    href ? 'cursor-pointer hover:bg-slate-100' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                    <div className="min-w-0">
                      <p className={cn('font-medium leading-snug', !n.isRead && 'text-slate-900')}>
                        {n.title}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-snug line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
