'use client'
// app/page.jsx
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getStudies } from '@/lib/api'

const ASSET_LABELS = {
  STOCK: 'Ações', CRYPTO: 'Cripto', FX: 'Câmbio',
  FIXED_INCOME: 'Renda Fixa', COMMODITY: 'Commodity',
  INDEX: 'Índice', OTHER: 'Outro',
}

export default function HomePage() {
  const [studies,   setStudies]   = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [search,    setSearch]    = useState('')
  const [searching, setSearching] = useState(false)
  const [loading,   setLoading]   = useState(true)

  // Carrega todos os estudos publicados uma vez
  useEffect(() => {
    async function load() {
      try {
        const data = await getStudies('?limit=100')
        setStudies(data?.data ?? [])
        setFiltered(data?.data ?? [])
      } catch { /* back offline */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  // Busca com debounce de 300ms — filtra apenas estudos do banco
  useEffect(() => {
    const q = search.trim().toLowerCase()
    if (!q) { setFiltered(studies); setSearching(false); return }

    setSearching(true)
    const timer = setTimeout(() => {
      const result = studies.filter((s) =>
        s.ticker?.toLowerCase().includes(q) ||
        s.title?.toLowerCase().includes(q)
      )
      setFiltered(result)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, studies])

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
 <Header />
   

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050a14] via-[#071428] to-[#050a14]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(6,78,120,0.25),transparent)]"/>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#00d4ff 1px,transparent 1px),linear-gradient(90deg,#00d4ff 1px,transparent 1px)', backgroundSize: '60px 60px' }}/>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-3xl">

        
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-4">
              <span className="text-white">Mercados Globais</span>
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Plataforma de Estudo
              </span>
            </h1>

          

            {/* Search — filtra estudos reais do banco */}
            <div className="relative max-w-xl">
              <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-md pointer-events-none"/>
              <div className="relative flex items-center bg-[#0a1628] border border-cyan-500/30 rounded-xl overflow-hidden focus-within:border-cyan-400 transition-colors">
                {searching
                  ? <svg className="animate-spin w-4 h-4 text-cyan-500 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  : <svg className="w-4 h-4 text-cyan-500 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                }
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquise por ticker ou título... (ex: PETR4)"
                  className="flex-1 bg-transparent px-4 py-4 text-white text-sm placeholder-zinc-600 focus:outline-none font-mono"
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="mr-3 text-zinc-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Resultado da busca */}
              {search && !searching && (
                <p className="mt-2 text-xs text-zinc-500 font-mono pl-1">
                  {filtered.length === 0
                    ? '— nenhum estudo encontrado para este ticker'
                    : `${filtered.length} estudo${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                  }
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Lista de estudos ── */}
      <section id="estudos" className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-cyan-400 font-mono tracking-widest mb-2">// ESTUDOS PUBLICADOS</p>
            <h2 className="text-2xl font-bold text-white">
              {search ? `Resultados para "${search.toUpperCase()}"` : 'Estudos Recentes'}
            </h2>
          </div>
          <span className="text-xs text-zinc-600 font-mono">
            {filtered.length} estudo{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-zinc-600">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <span className="text-sm font-mono">Carregando estudos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-sm font-mono">
              {search ? `Nenhum estudo encontrado para "${search.toUpperCase()}"` : 'Nenhum estudo publicado ainda.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((study, i) => (
              <StudyCard key={study.id} study={study} index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

function StudyCard({ study, index }) {
  const assetColor = {
    STOCK:        'text-blue-400 border-blue-500/30 bg-blue-500/5',
    CRYPTO:       'text-amber-400 border-amber-500/30 bg-amber-500/5',
    FX:           'text-purple-400 border-purple-500/30 bg-purple-500/5',
    FIXED_INCOME: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    INDEX:        'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    COMMODITY:    'text-orange-400 border-orange-500/30 bg-orange-500/5',
  }[study.assetClass] ?? 'text-zinc-400 border-zinc-700 bg-zinc-800/30'

  return (
    <Link href={`/estudos/${study.slug}`}
      className="group relative bg-[#0a1628] border border-white/5 rounded-xl p-5 hover:border-cyan-500/30 transition-all duration-200 overflow-hidden block">

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 group-hover:from-cyan-500/5 to-transparent transition-all duration-300 pointer-events-none rounded-xl"/>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/0 group-hover:via-cyan-500/50 to-transparent transition-all duration-300"/>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {study.ticker && (
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${assetColor}`}>
                {study.ticker}
              </span>
            )}
            {study.assetClass && (
              <span className="text-xs text-zinc-600 font-mono">{ASSET_LABELS[study.assetClass]}</span>
            )}
          </div>
          {study.timeframe && (
            <span className="font-mono text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded">
              {study.timeframe}
            </span>
          )}
        </div>

        <h3 className="font-bold text-white text-sm mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
          {study.title}
        </h3>

        {study.description && (
          <p className="text-zinc-500 text-xs line-clamp-2 mb-4 leading-relaxed">{study.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            {study.user?.avatarUrl && (
              <img src={study.user.avatarUrl} alt="" className="w-5 h-5 rounded-full opacity-80"/>
            )}
            <span className="text-zinc-600 text-xs truncate max-w-[120px]">{study.user?.name}</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-600 text-xs font-mono">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            {study._count?.charts ?? 0} gráf.
          </div>
        </div>
      </div>
    </Link>
  )
}