'use client'
// app/admin/estudos/[id]/page.jsx
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getMe, getStudy, updateStudy, updateChart, deleteChart, createChart, replacePoints, togglePublish } from '@/lib/api'

const CHART_TYPES = [
  { value: 'LINE',    label: 'Linha' },
  { value: 'AREA',    label: 'Área' },
  { value: 'BAR',     label: 'Barras' },
  { value: 'SCATTER', label: 'Dispersão' },
]

const ASSET_CLASSES = [
  { value: 'STOCK',        label: 'Ações' },
  { value: 'CRYPTO',       label: 'Criptomoedas' },
  { value: 'FX',           label: 'Câmbio (Forex)' },
  { value: 'FIXED_INCOME', label: 'Renda Fixa' },
  { value: 'COMMODITY',    label: 'Commodities' },
  { value: 'INDEX',        label: 'Índice' },
  { value: 'OTHER',        label: 'Outro' },
]

function pointsToText(points) {
  if (!points?.length) return ''
  return points.map((p) => {
    const iso = new Date(p.timestamp).toISOString().slice(0, 19)
    return `${iso}\t${parseFloat(p.close)}`
  }).join('\n')
}

function parsePoints(raw) {
  const lines = raw.trim().split('\n').filter(Boolean)
  const points = [], errors = []
  lines.forEach((line, i) => {
    const sep   = line.includes('\t') ? '\t' : ';'
    const parts = line.split(sep).map((p) => p.trim())
    if (parts.length < 2) { errors.push(`Linha ${i + 1}: use TAB ou ; entre hora e valor`); return }
    let rawDate = parts[0]
    if (/^\d{2}\/\d{2}\/\d{4}/.test(rawDate)) {
      const [d, m, rest] = rawDate.split('/')
      rawDate = `${rest.trim().slice(0, 4)}-${m}-${d}T${rest.trim().slice(5) || '00:00:00'}`
    }
    const ts    = new Date(rawDate)
    const close = parseFloat(parts[1].replace(',', '.'))
    if (isNaN(ts.getTime())) { errors.push(`Linha ${i + 1}: data inválida "${parts[0]}"`); return }
    if (isNaN(close))        { errors.push(`Linha ${i + 1}: valor inválido "${parts[1]}"`); return }
    points.push({ timestamp: ts.toISOString(), close })
  })
  return { points, errors }
}

export default function EditStudyPage() {
  const router = useRouter()
  const { id } = useParams()

  const [study,       setStudy]       = useState(null)
  const [charts,      setCharts]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [savingInfo,  setSavingInfo]  = useState(false)
  const [savingChart, setSavingChart] = useState(null)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        // Verifica permissão antes de carregar
        const me = await getMe()
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
        if (adminEmail && me.user?.email !== adminEmail) {
          router.replace('/acesso-negado')
          return
        }
        const data = await getStudy(id)
        setStudy(data)
        setCharts((data.charts ?? []).map((c) => ({
          ...c, pointsRaw: pointsToText(c.points), _dirty: false,
        })))
      } catch {
        router.replace('/admin')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function notify(msg, isError = false) {
    if (isError) { setError(msg); setSuccess('') }
    else         { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  async function saveStudyInfo() {
    setSavingInfo(true)
    try {
      await updateStudy(id, {
        title:       study.title,
        description: study.description || undefined,
        ticker:      study.ticker?.toUpperCase() || undefined,
        timeframe:   study.timeframe || undefined,
        assetClass:  study.assetClass || undefined,
      })
      notify('Informações salvas!')
    } catch (e) { notify(e.message, true) }
    finally { setSavingInfo(false) }
  }

  async function saveChart(chart) {
    setSavingChart(chart.id)
    try {
      const { points, errors } = parsePoints(chart.pointsRaw)
      if (errors.length) throw new Error(errors[0])
      await updateChart(id, chart.id, {
        title: chart.title, type: chart.type, analysis: chart.analysis,
      })
      if (points.length > 0) {
        await replacePoints(id, chart.id, points)
      }
      setCharts((prev) => prev.map((c) => c.id === chart.id ? { ...c, _dirty: false } : c))
      notify('Gráfico salvo!')
    } catch (e) { notify(e.message, true) }
    finally { setSavingChart(null) }
  }

  async function handleDeleteChart(chartId) {
    if (!confirm('Deletar este gráfico?')) return
    try {
      await deleteChart(id, chartId)
      setCharts((prev) => prev.filter((c) => c.id !== chartId))
      notify('Gráfico removido.')
    } catch (e) { notify(e.message, true) }
  }

  async function handleAddChart() {
    try {
      const created = await createChart(id, { title: 'Novo gráfico', type: 'LINE' })
      setCharts((prev) => [...prev, { ...created, pointsRaw: '', _dirty: false }])
      notify('Gráfico adicionado. Preencha os dados e salve.')
    } catch (e) { notify(e.message, true) }
  }

  async function handleToggle() {
    try {
      const res = await togglePublish(id)
      setStudy((prev) => ({ ...prev, published: res.published }))
      notify(res.published ? 'Estudo publicado!' : 'Estudo despublicado.')
    } catch (e) { notify(e.message, true) }
  }

  function updateChartField(chartId, key, value) {
    setCharts((prev) => prev.map((c) =>
      c.id === chartId ? { ...c, [key]: value, _dirty: true } : c
    ))
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-zinc-500 text-sm">
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Carregando...
      </div>
    </div>
  )

  const inp  = 'w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors'
  const inp2 = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors'
  const lbl  = 'block text-sm text-zinc-300 mb-1.5'

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin" className="text-zinc-400 hover:text-white text-sm transition-colors flex-shrink-0">
            ← Admin
          </Link>
          <span className="text-zinc-700">|</span>
          <span className="font-semibold text-sm truncate">{study?.title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {study?.slug && (
            <Link href={`/estudos/${study.slug}`} target="_blank"
              className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">
              Ver público ↗
            </Link>
          )}
          <button onClick={handleToggle}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              study?.published
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}>
            {study?.published ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Notificações */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
            ✕ {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl px-4 py-3">
            ✓ {success}
          </div>
        )}

        {/* Informações */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-800/40">
            <h2 className="text-sm font-semibold text-white">Informações do estudo</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              study?.published
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}>
              {study?.published ? '● Publicado' : '○ Rascunho'}
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className={lbl}>Título</label>
              <input value={study?.title ?? ''}
                onChange={(e) => setStudy((p) => ({ ...p, title: e.target.value }))}
                className={inp} />
            </div>
            <div>
              <label className={lbl}>Descrição</label>
              <textarea value={study?.description ?? ''}
                onChange={(e) => setStudy((p) => ({ ...p, description: e.target.value }))}
                rows={2} className={inp + ' resize-none'} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Ticker</label>
                <input value={study?.ticker ?? ''}
                  onChange={(e) => setStudy((p) => ({ ...p, ticker: e.target.value }))}
                  className={inp + ' font-mono uppercase'} placeholder="PETR4" />
              </div>
              <div>
                <label className={lbl}>Timeframe</label>
                <input value={study?.timeframe ?? ''}
                  onChange={(e) => setStudy((p) => ({ ...p, timeframe: e.target.value }))}
                  className={inp + ' font-mono'} placeholder="1H" />
              </div>
              <div>
                <label className={lbl}>Classe</label>
                <select value={study?.assetClass ?? ''}
                  onChange={(e) => setStudy((p) => ({ ...p, assetClass: e.target.value }))}
                  className={inp}>
                  <option value="">—</option>
                  {ASSET_CLASSES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={saveStudyInfo} disabled={savingInfo}
                className="px-5 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                {savingInfo ? 'Salvando...' : 'Salvar informações'}
              </button>
            </div>
          </div>
        </section>

        {/* Gráficos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">
              Gráficos <span className="text-zinc-500 font-normal">({charts.length})</span>
            </h2>
            <button onClick={handleAddChart}
              className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Adicionar gráfico
            </button>
          </div>

          {charts.length === 0 && (
            <div className="border border-zinc-800 border-dashed rounded-xl py-12 text-center text-zinc-600 text-sm">
              Nenhum gráfico ainda — clique em "Adicionar gráfico"
            </div>
          )}

          <div className="space-y-5">
            {charts.map((chart, idx) => (
              <div key={chart.id}
                className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-colors ${
                  chart._dirty ? 'border-amber-500/30' : 'border-zinc-800'
                }`}>

                <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Gráfico {idx + 1}</span>
                    {chart._dirty && <span className="text-xs text-amber-400">● não salvo</span>}
                  </div>
                  <button onClick={() => handleDeleteChart(chart.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Remover
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className={lbl}>Título</label>
                      <input value={chart.title}
                        onChange={(e) => updateChartField(chart.id, 'title', e.target.value)}
                        className={inp2} />
                    </div>
                    <div>
                      <label className={lbl}>Tipo</label>
                      <select value={chart.type}
                        onChange={(e) => updateChartField(chart.id, 'type', e.target.value)}
                        className={inp2}>
                        {CHART_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-zinc-300">Dados (hora + fechamento)</label>
                      <span className="text-xs text-zinc-600 font-mono">
                        {chart.pointsRaw.trim().split('\n').filter(Boolean).length} pontos
                      </span>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 mb-2 text-xs text-zinc-500 font-mono">
                      Cole do Excel (2 colunas):&nbsp;
                      <span className="text-zinc-400">2024-03-01T09:00:00 → 37.20</span>
                    </div>
                    <textarea value={chart.pointsRaw}
                      onChange={(e) => updateChartField(chart.id, 'pointsRaw', e.target.value)}
                      rows={6} spellCheck={false}
                      className={inp2 + ' font-mono text-xs resize-y leading-relaxed'} />
                  </div>

                  <div>
                    <label className={lbl}>
                      Análise
                      <span className="text-zinc-500 font-normal ml-1.5 text-xs">— suporta markdown</span>
                    </label>
                    <textarea value={chart.analysis ?? ''}
                      onChange={(e) => updateChartField(chart.id, 'analysis', e.target.value)}
                      rows={5} placeholder="## Observações&#10;&#10;O ativo abriu em **R$ 37,20**..."
                      className={inp2 + ' font-mono text-xs resize-y leading-relaxed'} />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button onClick={() => saveChart(chart)} disabled={savingChart === chart.id}
                      className="px-5 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                      {savingChart === chart.id ? 'Salvando...' : 'Salvar gráfico'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}