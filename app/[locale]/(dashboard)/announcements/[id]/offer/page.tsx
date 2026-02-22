'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { offerSchema, OfferInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { PriceInsightCard } from '@/components/offers/PriceInsightCard'

const TRANSPORT_TYPES = ['AIR', 'SEA', 'RAIL', 'ROAD']
const CURRENCIES = ['USD', 'EUR', 'AZN']

export default function CreateOfferPage() {
  const t = useTranslations('offers')
  const tc = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const announcementId = params.id as string

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [announcement, setAnnouncement] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/announcements/${announcementId}`)
      .then((r) => r.json())
      .then(setAnnouncement)
  }, [announcementId])

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<OfferInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(offerSchema) as any,
    defaultValues: {
      announcementId,
      notes: '',
      items: [{ transportType: 'AIR', price: 0, currency: 'USD', deliveryDays: 1, notes: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || t('createError'))
      } else {
        router.push(`/${locale}/announcements/${announcementId}`)
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
          <Link href={`/${locale}/announcements/${announcementId}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {tc('back')}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">{t('createOffer')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offer Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>{t('notes')}</Label>
              <Textarea
                {...register('notes')}
                className="mt-1"
                rows={2}
                placeholder="Additional notes about your offer..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Transport Options</Label>
                {fields.length < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ transportType: 'SEA', price: 0, currency: 'USD', deliveryDays: 1 })}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    {t('addTransportItem')}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const currentTransport = watch(`items.${index}.transportType`)
                  const currentPrice = Number(watch(`items.${index}.price`)) || 0

                  return (
                    <div key={field.id} className="bg-slate-50 rounded-lg p-4 relative space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t('transportType')}</Label>
                          <Select
                            value={watch(`items.${index}.transportType`)}
                            onValueChange={(val) => setValue(`items.${index}.transportType`, val as any)}
                          >
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TRANSPORT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>
                                  {t(`transport.${type}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">{t('currency')}</Label>
                          <Select
                            value={watch(`items.${index}.currency`)}
                            onValueChange={(val) => setValue(`items.${index}.currency`, val as any)}
                          >
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENCIES.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">{t('price')}</Label>
                          <Input
                            {...register(`items.${index}.price`)}
                            type="number"
                            step="0.01"
                            className="mt-1 bg-white"
                            placeholder="5000"
                          />
                          {errors.items?.[index]?.price && (
                            <p className="text-xs text-red-500 mt-0.5">{errors.items[index]?.price?.message}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">{t('deliveryDays')}</Label>
                          <Input
                            {...register(`items.${index}.deliveryDays`)}
                            type="number"
                            className="mt-1 bg-white"
                            placeholder="7"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">{t('notes')} (optional)</Label>
                          <Input
                            {...register(`items.${index}.notes`)}
                            className="mt-1 bg-white"
                            placeholder="Notes for this transport type..."
                          />
                        </div>
                      </div>

                      {/* Price Insight Card */}
                      {announcement && (
                        <PriceInsightCard
                          transportType={currentTransport}
                          cargoType={announcement.cargoType ?? ''}
                          origin={announcement.origin ?? ''}
                          destination={announcement.destination ?? ''}
                          currentPrice={currentPrice}
                        />
                      )}

                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href={`/${locale}/announcements/${announcementId}`}>{tc('cancel')}</Link>
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
