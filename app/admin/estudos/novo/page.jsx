'use client'
// app/admin/estudos/novo/page.jsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMe, createStudy, createChart, replacePoints } from '@/lib/api'

const ASSET_CLASSES = [
  { value: 'STOCK',        label: 'Ações' },
  { value: 'CRYPTO',       label: 'Criptomoedas' },
  { value: 'FX',           label: 'Câmbio (Forex)' },
  { value: 'FIXED_INCOME', label: 'Renda Fixa' },
  { value: 'COMMODITY',    label: 'Commodities' },
  { value: 'INDEX',        label: 'Índice' },
  { value: 'OTHER',        label: 'Outro' },
]

const CHART_TYPES = [
  { value: 'LINE',    label: 'Linha' },
  { value: 'AREA',    label: 'Área' },
  { value: 'BAR',     label: 'Barras' },
  { value: 'SCATTER', label: 'Dispersão' },
]

function newChart() {
  return {
    _id:       Math.random().toString(36).slice(2),
    title:     '',
    type:      'LINE',
    analysis:  '',
    pointsRaw: '',
  }
}

// Aceita:
//   2024-03-01T09:00:00[TAB]37.20
//   2024-03-01T09:00:00;37.20
//   01/03/2024 09:00;37,20  (BR com vírgula)
function parsePoints(raw) {
  const lines  = raw.trim().split('\n').filter(Boolean)
  const points = []
  const errors = []

  lines.forEach((line, i) => {
    const sep   = line.includes('\t') ? '\t' : ';'
    const parts = line.split(sep).map(p => p.trim())
    if (parts.length < 2) { errors.push(`Linha ${i+1}: use TAB ou ; entre hora e valor`); return }

    let rawDate = parts[0]
    // dd/mm/yyyy hh:mm → ISO
    if (/^\d{2}\/\d{2}\/\d{4}/.test(rawDate)) {
      const [d, m, rest] = rawDate.split('/')
      const time = rest.trim().includes(':') ? rest.trim().slice(5) : '00:00:00'
      rawDate = `${rest.trim().slice(0,4)}-${m}-${d}T${time}`
    }

    const ts    = new Date(rawDate)
    const close = parseFloat(parts[1].replace(',', '.'))

    if (isNaN(ts.getTime())) { errors.push(`Linha ${i+1}: data inválida "${parts[0]}"`); return }
    if (isNaN(close))        { errors.push(`Linha ${i+1}: valor inválido "${parts[1]}"`); return }

    points.push({ timestamp: ts.toISOString(), close })
  })

  return { points, errors }
}

export default function NovoEstudoPage() {
  const router  = useRouter()

  useEffect(() => {
    async function checkAccess() {
      try {
        const me = await getMe()
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
        if (adminEmail && me.user?.email !== adminEmail) {
          router.replace('/acesso-negado')
        }
      } catch {
        router.replace('/login')
      }
    }
    checkAccess()
  }, [])

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [step,   setStep]   = useState(1) // 1 = info, 2 = gráficos

  const [study, setStudy] = useState({
    title: '', description: '', ticker: '', timeframe: '', assetClass: '',
  })
  const [charts, setCharts] = useState([newChart()])

  function updateStudy(k, v)    { setStudy(p => ({ ...p, [k]: v })) }
  function addChart()            { setCharts(p => [...p, newChart()]) }
  function removeChart(id)       { setCharts(p => p.filter(c => c._id !== id)) }
  function updateChart(id, k, v) { setCharts(p => p.map(c => c._id === id ? { ...c, [k]: v } : c)) }

  function countPoints(raw) {
    return raw.trim().split('\n').filter(Boolean).length
  }

  async function handleSubmit() {
    setError('')
    setSaving(true)
    try {
      if (!study.title.trim()) throw new Error('Título do estudo é obrigatório.')

      const created = await createStudy({
        title:       study.title.trim(),
        description: study.description || undefined,
        ticker:      study.ticker.toUpperCase() || undefined,
        timeframe:   study.timeframe || undefined,
        assetClass:  study.assetClass || undefined,
      })

      for (const chart of charts) {
        if (!chart.title.trim()) continue

        const { points, errors } = parsePoints(chart.pointsRaw)
        if (errors.length > 0) throw new Error(`Gráfico "${chart.title}": ${errors[0]}`)

        await createChart(created.id, {
          title:    chart.title.trim(),
          type:     chart.type,
          analysis: chart.analysis || undefined,
          points,
        })
      }

      router.push('/admin')
    } catch (err) {
      setError(err.message)
      setStep(err.message.includes('Gráfico') ? 2 : 1)
    } finally {
      setSaving(false)
    }
  }

  // ── input class helpers ────────────────────────────────────────────────────
  const inp  = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
  const inp2 = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
  const lbl  = "block text-sm text-zinc-300 mb-1.5"

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-zinc-400 hover:text-white text-sm transition-colors">← Admin</Link>
          <span className="text-zinc-700">|</span>
          <span className="font-semibold text-sm">Novo Estudo</span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <button key={s} onClick={() => setStep(s)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                step === s ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'
              }`}>{s}</span>
              {s === 1 ? 'Informações' : 'Gráficos'}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* ── Step 1: Informações do estudo ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Informações do estudo</h2>
              <p className="text-zinc-500 text-sm">Dados gerais sobre o ativo e o período analisado.</p>
            </div>

            <div>
              <label className={lbl}>Título <span className="text-red-400">*</span></label>
              <input value={study.title} onChange={e => updateStudy('title', e.target.value)}
                placeholder="Ex: Análise PETR4 — Março 2024" className={inp}/>
            </div>

            <div>
              <label className={lbl}>Descrição</label>
              <textarea value={study.description} onChange={e => updateStudy('description', e.target.value)}
                placeholder="Resumo do que será analisado..." rows={3}
                className={inp + ' resize-none'}/>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Ticker</label>
                <input value={study.ticker} onChange={e => updateStudy('ticker', e.target.value)}
                  placeholder="PETR4" className={inp + ' font-mono uppercase'}/>
              </div>
              <div>
                <label className={lbl}>Timeframe</label>
                <input value={study.timeframe} onChange={e => updateStudy('timeframe', e.target.value)}
                  placeholder="1H" className={inp + ' font-mono'}/>
              </div>
              <div>
                <label className={lbl}>Classe do ativo</label>
                <select value={study.assetClass} onChange={e => updateStudy('assetClass', e.target.value)} className={inp}>
                  <option value="">Selecione</option>
                  {ASSET_CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => { if (!study.title.trim()) { setError('Título é obrigatório.'); return }; setError(''); setStep(2) }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl transition-colors">
                Próximo: Gráficos
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Gráficos ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Gráficos</h2>
                <p className="text-zinc-500 text-sm">Adicione os dados e análise para cada gráfico.</p>
              </div>
              <button onClick={addChart}
                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Adicionar gráfico
              </button>
            </div>

            {charts.map((chart, idx) => (
              <div key={chart._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

                {/* Header do card */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-800/40">
                  <span className="text-xs font-medium text-zinc-400">Gráfico {idx + 1}</span>
                  {charts.length > 1 && (
                    <button onClick={() => removeChart(chart._id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      Remover
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-4">

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className={lbl}>Título do gráfico</label>
                      <input value={chart.title} onChange={e => updateChart(chart._id, 'title', e.target.value)}
                        placeholder="Ex: Fechamento 01/03" className={inp2}/>
                    </div>
                    <div>
                      <label className={lbl}>Tipo</label>
                      <select value={chart.type} onChange={e => updateChart(chart._id, 'type', e.target.value)} className={inp2}>
                        {CHART_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Dados */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={lbl.replace('mb-1.5', 'mb-0')}>Dados (hora + fechamento)</label>
                      <span className="text-xs text-zinc-600 font-mono">
                        {countPoints(chart.pointsRaw)} ponto{countPoints(chart.pointsRaw) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 mb-2 text-xs text-zinc-500 font-mono">
                      Cole do Excel (2 colunas) ou digite: &nbsp;
                      <span className="text-zinc-400">2024-03-01T09:00:00 → 37.20</span>
                    </div>
                    <textarea
                      value={chart.pointsRaw}
                      onChange={e => updateChart(chart._id, 'pointsRaw', e.target.value)}
                      placeholder={"2024-03-01T09:00:00\t37.20\n2024-03-01T10:00:00\t37.45\n2024-03-01T11:00:00\t36.90"}
                      rows={7} spellCheck={false}
                      className={inp2 + ' font-mono text-xs resize-y leading-relaxed'}
                    />
                  </div>

                  {/* Análise */}
                  <div>
                    <label className={lbl}>
                      Análise
                      <span className="text-zinc-500 font-normal ml-1.5 text-xs">— exibida ao lado do gráfico, suporta markdown</span>
                    </label>
                    <textarea
                      value={chart.analysis}
                      onChange={e => updateChart(chart._id, 'analysis', e.target.value)}
                      placeholder={"## Observações\n\nO ativo abriu em **R$ 37,20**...\n\n- Ponto de atenção 1\n- Ponto de atenção 2\n\n> Conclusão ou nota importante"}
                      rows={7}
                      className={inp2 + ' font-mono text-xs resize-y leading-relaxed'}
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-zinc-800">
          {step === 2 && (
            <button onClick={() => setStep(1)}
              className="px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm transition-colors">
              ← Voltar
            </button>
          )}
          <Link href="/admin"
            className="px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm transition-colors">
            Cancelar
          </Link>
          {step === 2 && (
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
              {saving
                ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Salvando...</>)
                : 'Salvar estudo'
              }
            </button>
          )}
        </div>

      </div>
    </div>
  )
}