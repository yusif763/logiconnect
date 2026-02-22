'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterSupplierPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyType: 'SUPPLIER' }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Registration failed')
      } else {
        setSuccess(true)
        setTimeout(() => router.push(`/${locale}/login`), 2000)
      }
    } catch {
      setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="h-8 w-8 text-blue-400" />
            <span className="font-bold text-2xl text-white">LogiConnect</span>
          </div>
          <p className="text-slate-400 text-sm">{t('supplierDesc')}</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle>{t('registerSupplier')}</CardTitle>
            <CardDescription>Create your supplier account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{t('registerSuccess')}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('name')}</Label>
                  <Input {...register('name')} className="mt-1" placeholder="John Doe" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>{t('email')}</Label>
                  <Input {...register('email')} type="email" className="mt-1" placeholder="you@company.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <Label>{t('password')}</Label>
                <Input {...register('password')} type="password" className="mt-1" placeholder="••••••••" />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Company Information</p>
                <div className="space-y-3">
                  <div>
                    <Label>{t('companyName')}</Label>
                    <Input {...register('companyName')} className="mt-1" placeholder="ACME Corp LLC" />
                    {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{t('companyEmail')}</Label>
                      <Input {...register('companyEmail')} type="email" className="mt-1" placeholder="info@company.com" />
                      {errors.companyEmail && <p className="text-xs text-red-500 mt-1">{errors.companyEmail.message}</p>}
                    </div>
                    <div>
                      <Label>{t('companyPhone')}</Label>
                      <Input {...register('companyPhone')} className="mt-1" placeholder="+994501234567" />
                      {errors.companyPhone && <p className="text-xs text-red-500 mt-1">{errors.companyPhone.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label>{t('companyAddress')}</Label>
                    <Input {...register('companyAddress')} className="mt-1" placeholder="123 Main St, Baku" />
                    {errors.companyAddress && <p className="text-xs text-red-500 mt-1">{errors.companyAddress.message}</p>}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {t('register')}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              {t('hasAccount')}{' '}
              <Link href={`/${locale}/login`} className="text-blue-600 hover:underline font-medium">
                {t('login')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
