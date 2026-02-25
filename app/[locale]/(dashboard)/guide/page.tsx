'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Truck, Package, FileText, BarChart3, MessageCircle,
  CheckCircle, Star, TrendingUp, Clock, Shield, Zap,
  DollarSign, Users, Globe, Award, ArrowRight, PlayCircle
} from 'lucide-react'

export default function GuidePage() {
  const { data: session } = useSession()
  const [selectedGuide, setSelectedGuide] = useState<'logistics' | 'supplier'>('logistics')

  const isSupplier = session?.user.role === 'SUPPLIER_EMPLOYEE'
  const isLogistics = session?.user.role === 'LOGISTICS_EMPLOYEE'

  // Auto-select based on role
  useState(() => {
    if (isSupplier) setSelectedGuide('supplier')
    if (isLogistics) setSelectedGuide('logistics')
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          LogiConnect Platforması
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Azərbaycanda logistika və təchizat şirkətlərini birləşdirən ən müasir B2B platforma
        </p>
      </div>

      {/* Guide Selection */}
      <div className="flex justify-center">
        <Tabs value={selectedGuide} onValueChange={(v) => setSelectedGuide(v as any)} className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logistics" className="gap-2">
              <Truck className="h-4 w-4" />
              Logistika Şirkətləri
            </TabsTrigger>
            <TabsTrigger value="supplier" className="gap-2">
              <Package className="h-4 w-4" />
              Təchizatçı Şirkətlər
            </TabsTrigger>
          </TabsList>

          {/* Logistics Guide */}
          <TabsContent value="logistics" className="mt-8 space-y-8">
            <LogisticsGuide />
          </TabsContent>

          {/* Supplier Guide */}
          <TabsContent value="supplier" className="mt-8 space-y-8">
            <SupplierGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LogisticsGuide() {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Card */}
      <Card className="glass-card border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            Logistika Şirkətləri üçün
          </CardTitle>
          <CardDescription className="text-base">
            Daha çox müştəri, daha çox sifariş, daha çox gəlir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Pulsuz qeydiyyat
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Komissiyasız
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> 24/7 Dəstək
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <TrendingUp className="h-10 w-10 text-green-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Daha Çox Sifariş</h3>
            <p className="text-sm text-slate-600">
              Yüzlərlə təchizatçı şirkətdən gələn elanları görün və təklif verin
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="pt-6">
            <Clock className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Vaxt Qazanın</h3>
            <p className="text-sm text-slate-600">
              Avtomatlaşdırılmış sistem sayəsində daha sürətli cavab verin
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="pt-6">
            <DollarSign className="h-10 w-10 text-yellow-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Rəqabət Üstünlüyü</h3>
            <p className="text-sm text-slate-600">
              Qiymətlərinizi müqayisə edin və optimal təklif verin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Əsas Funksiyalar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeatureItem
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            title="Elan Bazarı"
            description="Bütün aktiv yük elanlarını bir yerdə görün. Origin, destination və yük növünə görə axtarış edin."
          />
          <FeatureItem
            icon={<MessageCircle className="h-5 w-5 text-green-500" />}
            title="Birbaşa Danışıqlar"
            description="Təchizatçılarla platformada birbaşa yazışın, qiymət danışıqları aparın."
          />
          <FeatureItem
            icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
            title="Analitika və Hesabatlar"
            description="Təkliflərinizin statistikasını izləyin, qazanc faizinizi artırın."
          />
          <FeatureItem
            icon={<Truck className="h-5 w-5 text-orange-500" />}
            title="Daşıma İzləmə"
            description="Real-time göndərmə izləmə, milestone yeniləmələri."
          />
          <FeatureItem
            icon={<Award className="h-5 w-5 text-red-500" />}
            title="Reytinq Sistemi"
            description="Müştəri rəylərini toplayın, reytinqinizi yüksəldin."
          />
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="bg-gradient-to-br from-slate-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-500" />
            Necə İşləyir?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <StepItem
              number="1"
              title="Qeydiyyatdan Keçin"
              description="Şirkət məlumatlarınızı daxil edin və doğrulanmağı gözləyin (24 saat)"
            />
            <StepItem
              number="2"
              title="Elanları İzləyin"
              description="Dashboard-da bütün aktiv yük elanlarını görün və maraq etdiyinizi seçin"
            />
            <StepItem
              number="3"
              title="Təklif Verin"
              description="Hava, dəniz, dəmir və avtomobil daşımaları üçün qiymət və müddət təklif edin"
            />
            <StepItem
              number="4"
              title="Danışıqlar Aparın"
              description="Platformada təchizatçı ilə yazışın, şərtləri razılaşdırın"
            />
            <StepItem
              number="5"
              title="Qəbul Olun"
              description="Təklifiniz qəbul olunanda avtomatik göndərmə yaradılır"
            />
            <StepItem
              number="6"
              title="Daşımaya Başlayın"
              description="Real-time milestone yeniləmələri ilə göndərməni izləyin"
            />
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="py-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Hazır mısınız?</h2>
          <p className="text-blue-100">
            İndi qoşulun və yeni müştərilər qazanmağa başlayın
          </p>
          <Button size="lg" variant="secondary" className="gap-2">
            Daha Ətraflı
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SupplierGuide() {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Card */}
      <Card className="glass-card border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6 text-green-600" />
            Təchizatçı Şirkətlər üçün
          </CardTitle>
          <CardDescription className="text-base">
            Yüklərinizi sürətlə və etibarlı daşıyın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Pulsuz elan
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Sürətli təkliflər
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Etibarlı şirkətlər
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <Users className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Geniş Şəbəkə</h3>
            <p className="text-sm text-slate-600">
              Azərbaycanda ən böyük logistika şirkətləri şəbəkəsinə çıxış
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="pt-6">
            <DollarSign className="h-10 w-10 text-green-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Ən Yaxşı Qiymət</h3>
            <p className="text-sm text-slate-600">
              Rəqabətli təkliflər alın və ən sərfəli variantı seçin
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="pt-6">
            <Shield className="h-10 w-10 text-purple-500 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Təhlükəsizlik</h3>
            <p className="text-sm text-slate-600">
              Yalnız doğrulanmış logistika şirkətləri ilə işləyin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Əsas Funksiyalar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeatureItem
            icon={<FileText className="h-5 w-5 text-green-500" />}
            title="Sürətli Elan Yaratma"
            description="Sadə formada yük məlumatlarını daxil edin və dərhal elan yayımlayın."
          />
          <FeatureItem
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
            title="Real-time Təkliflər"
            description="Elanınız dərc olduqdan sonra dərhal təkliflər almağa başlayın."
          />
          <FeatureItem
            icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
            title="Təklif Müqayisəsi"
            description="Bütün təklifləri yan-yana müqayisə edin, qiymət və müddətə görə seçin."
          />
          <FeatureItem
            icon={<MessageCircle className="h-5 w-5 text-purple-500" />}
            title="Danışıq Platforması"
            description="Logistika şirkətləri ilə birbaşa yazışın, şərtləri razılaşdırın."
          />
          <FeatureItem
            icon={<Truck className="h-5 w-5 text-orange-500" />}
            title="Canlı İzləmə"
            description="Yükünüzün hara olduğunu real-time izləyin."
          />
          <FeatureItem
            icon={<Award className="h-5 w-5 text-red-500" />}
            title="Reytinq və Rəylər"
            description="Xidmət bitdikdən sonra logistika şirkətini qiymətləndirin."
          />
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="bg-gradient-to-br from-slate-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-green-500" />
            Necə İşləyir?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <StepItem
              number="1"
              title="Hesab Yaradın"
              description="Şirkət məlumatlarınızı daxil edin və 24 saat ərzində doğrulanın"
            />
            <StepItem
              number="2"
              title="Yük Elanı Yerləşdirin"
              description="Origin, destination, çəki, yük növü və termin tarixini göstərin"
            />
            <StepItem
              number="3"
              title="Təklifləri Gözləyin"
              description="Logistika şirkətləri sizin elanınıza təkliflər göndərəcək"
            />
            <StepItem
              number="4"
              title="Müqayisə Edin"
              description="Təklifləri qiymət, müddət və reytinqə görə müqayisə edin"
            />
            <StepItem
              number="5"
              title="Ən Yaxşısını Seçin"
              description="Sizə uyğun olan təklifi qəbul edin"
            />
            <StepItem
              number="6"
              title="İzləyin və Qiymətləndirin"
              description="Daşımanı izləyin və xidmət bitdikdən sonra rəy yazın"
            />
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardContent className="py-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">İlk elanınızı yerləşdirin</h2>
          <p className="text-green-100">
            Ən yaxşı logistika həllərini kəşf edin
          </p>
          <Button size="lg" variant="secondary" className="gap-2">
            Elan Yarat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function StepItem({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}