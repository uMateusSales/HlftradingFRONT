'use client'
// app/estudos/[slug]/page.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStudy } from '@/lib/api'
import ChartView from '@/components/ChartView'
import Header from '@/components/Header'

export default function StudyPage() {
  const { slug }  = useParams()
  const [study,   setStudy]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudy(slug)
        setStudy(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-zinc-500 text-sm">
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Carregando estudo...
      </div>
    </div>
  )

  if (error || !study) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
      <p>Estudo não encontrado.</p>
      <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
        ← Voltar para a lista
      </Link>
    </div>
  )

  const assetColors = {
    STOCK:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CRYPTO:       'bg-amber-500/10 text-amber-400 border-amber-500/20',
    FX:           'bg-purple-500/10 text-purple-400 border-purple-500/20',
    FIXED_INCOME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    INDEX:        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    COMMODITY:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
<Header />
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm">
            ← Voltar
          </Link>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-300 text-sm font-medium truncate">{study.title}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Cabeçalho do estudo */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {study.ticker && (
              <span className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded-md border ${assetColors[study.assetClass] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                {study.ticker}
              </span>
            )}
            {study.timeframe && (
              <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-md border border-zinc-700">
                {study.timeframe}
              </span>
            )}
            {study.tags?.map((tag) => (
              <span key={tag.id} className="text-xs text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-800">
                {tag.name}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{study.title}</h1>

          {study.description && (
            <p className="text-zinc-400 text-base max-w-2xl">{study.description}</p>
          )}

          <div className="flex items-center gap-2 mt-4">
         
            <span className="text-zinc-500 text-sm">{study.user?.name}</span>
          </div>
        </div>

        {/* Gráficos */}
        {!study.charts?.length ? (
          <div className="text-center py-20 text-zinc-600">
            Nenhum gráfico publicado neste estudo ainda.
          </div>
        ) : (
          <div className="space-y-10">
            {study.charts.map((chart) => (
              <ChartView key={chart.id} chart={chart} />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}