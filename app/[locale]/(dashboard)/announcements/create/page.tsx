'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { announcementSchema, AnnouncementInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateAnnouncementPage() {
  const { data: session } = useSession()
  const t = useTranslations('announcements')
  const tc = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<AnnouncementInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(announcementSchema) as any,
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || t('createError'))
      } else {
        router.push(`/${locale}/announcements`)
      }
    } catch {
      setError(t('createError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/announcements`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {tc('back')}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{t('create')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Announcement Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>{t('announcementTitle')}</Label>
              <Input {...register('title')} className="mt-1" placeholder="Electronics cargo to Frankfurt" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label>{t('description')}</Label>
              <Textarea {...register('description')} className="mt-1" rows={3} placeholder="Describe the cargo..." />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{t('cargoType')}</Label>
                <Input {...register('cargoType')} className="mt-1" placeholder="Electronics" />
                {errors.cargoType && <p className="text-xs text-red-500 mt-1">{errors.cargoType.message}</p>}
              </div>
              <div>
                <Label>{t('weight')}</Label>
                <Input {...register('weight')} type="number" step="0.1" className="mt-1" placeholder="2500" />
                {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight.message}</p>}
              </div>
              <div>
                <Label>{t('volume')}</Label>
                <Input {...register('volume')} type="number" step="0.1" className="mt-1" placeholder="15" />
                {errors.volume && <p className="text-xs text-red-500 mt-1">{errors.volume.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('origin')}</Label>
                <Input {...register('origin')} className="mt-1" placeholder="Baku, Azerbaijan" />
                {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin.message}</p>}
              </div>
              <div>
                <Label>{t('destination')}</Label>
                <Input {...register('destination')} className="mt-1" placeholder="Frankfurt, Germany" />
                {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination.message}</p>}
              </div>
            </div>

            <div>
              <Label>{t('deadline')}</Label>
              <Input {...register('deadline')} type="datetime-local" className="mt-1" />
              {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href={`/${locale}/announcements`}>{tc('cancel')}</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {tc('submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
