'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface OfferItem {
  transportType: string
  price: number
  currency: string
  deliveryDays: number
  notes?: string
}

interface EditOfferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: {
    id: string
    notes?: string
    items: OfferItem[]
  }
  onSave: (data: { notes?: string; items: OfferItem[] }) => Promise<void>
}

const transportTypes = [
  { value: 'AIR' },
  { value: 'SEA' },
  { value: 'RAIL' },
  { value: 'ROAD' },
]

export function EditOfferModal({
  open,
  onOpenChange,
  offer,
  onSave,
}: EditOfferModalProps) {
  const t = useTranslations('offers')
  const tc = useTranslations('common')
  const [notes, setNotes] = useState(offer.notes || '')
  const [items, setItems] = useState<OfferItem[]>(offer.items)
  const [saving, setSaving] = useState(false)

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        transportType: 'ROAD',
        price: 0,
        currency: 'USD',
        deliveryDays: 1,
        notes: '',
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (
    index: number,
    field: keyof OfferItem,
    value: any
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSave = async () => {
    if (items.length === 0) {
      alert(t('addAtLeastOne'))
      return
    }

    setSaving(true)
    try {
      await onSave({ notes, items })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save offer:', error)
      alert(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editOfferTitle')}</DialogTitle>
          <DialogDescription>
            {t('editOfferDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')}</Label>
            <Textarea
              id="notes"
              placeholder={`${t('notes')}...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">{t('history.transportTypes')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t('addTransportItem')}
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {t('transportNumber')} #{index + 1}
                    </h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('transportType')}</Label>
                      <Select
                        value={item.transportType}
                        onValueChange={(value) =>
                          handleItemChange(index, 'transportType', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {transportTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {t(`transport.${type.value}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('deliveryPeriod')}</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.deliveryDays}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'deliveryDays',
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('price')}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('currency')}</Label>
                      <Select
                        value={item.currency}
                        onValueChange={(value) =>
                          handleItemChange(index, 'currency', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="AZN">AZN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>{t('notes')}</Label>
                      <Input
                        placeholder={t('transportNotes')}
                        value={item.notes || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'notes', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {tc('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {tc('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}