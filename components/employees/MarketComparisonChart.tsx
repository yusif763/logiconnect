'use client'

import { useTranslations } from 'next-intl'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MarketDataPoint {
  name: string
  myPrice: number
  marketMin: number
  marketMax: number
  acceptedPrice: number | null
  competitiveness: number
}

interface MarketComparisonChartProps {
  data: MarketDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as MarketDataPoint
  if (!d) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm max-w-xs">
      <p className="font-semibold text-slate-900 mb-2 truncate">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-blue-600 font-medium">My price:</span>
          <span className="font-mono font-semibold">{d.myPrice?.toLocaleString()} USD</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Market min:</span>
          <span className="font-mono">{d.marketMin?.toLocaleString()} USD</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Market max:</span>
          <span className="font-mono">{d.marketMax?.toLocaleString()} USD</span>
        </div>
        {d.acceptedPrice != null && (
          <div className="flex justify-between gap-4 border-t pt-1.5">
            <span className="text-emerald-600 font-medium">Accepted:</span>
            <span className="font-mono font-semibold text-emerald-700">{d.acceptedPrice?.toLocaleString()} USD</span>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t pt-1.5">
          <span className="text-slate-600">Score:</span>
          <span className={`font-semibold ${d.competitiveness >= 70 ? 'text-emerald-600' : d.competitiveness >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
            {d.competitiveness}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function MarketComparisonChart({ data }: MarketComparisonChartProps) {
  const t = useTranslations('performance')

  // Transform data for stacked bar: base = marketMin, range = marketMax - marketMin
  const chartData = data.map((d) => ({
    ...d,
    marketBase: d.marketMin,
    marketRange: d.marketMax - d.marketMin,
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        {t('noData')}
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('marketComparison')}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const labels: Record<string, string> = {
                marketBase: 'Market Min',
                marketRange: 'Market Range',
                myPrice: t('myPrice'),
                acceptedPrice: t('acceptedPrice'),
              }
              return <span className="text-xs">{labels[value] || value}</span>
            }}
          />
          {/* Transparent base for stacked bar */}
          <Bar dataKey="marketBase" stackId="market" fill="transparent" stroke="none" legendType="none" />
          {/* Market range bar */}
          <Bar dataKey="marketRange" stackId="market" fill="#cbd5e1" fillOpacity={0.6} radius={[4, 4, 0, 0]} name="marketRange" />
          {/* My price line */}
          <Line
            type="monotone"
            dataKey="myPrice"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            name="myPrice"
          />
          {/* Accepted price line */}
          <Line
            type="monotone"
            dataKey="acceptedPrice"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
            name="acceptedPrice"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
