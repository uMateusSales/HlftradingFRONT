'use client'
// app/admin/page.jsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getMe, getMyStudies, deleteStudy, togglePublish, logout, saveToken } from '@/lib/api'

export default function AdminPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [user,       setUser]       = useState(null)
  const [studies,    setStudies]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    async function load() {
      // Captura o token da URL (?token=...) após o redirect do OAuth
      const tokenFromUrl = searchParams.get('token')
      if (tokenFromUrl) {
        saveToken(tokenFromUrl)
        // Limpa o token da URL sem recarregar a página
        window.history.replaceState({}, '', '/admin')
      }

      try {
        const me = await getMe()

        // Verifica se o e-mail é o admin autorizado — redireciona imediatamente se não for
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
        if (adminEmail && me.user?.email !== adminEmail) {
          router.replace('/acesso-negado')
          return
        }

        setUser(me.user)
        const data = await getMyStudies()
        setStudies(data?.data ?? [])
      } catch (err) {
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleDelete(id, title) {
    if (!confirm(`Deletar "${title}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteStudy(id)
      setStudies((prev) => prev.filter((s) => s.id !== id))
    } catch (e) { alert(e.message) }
  }

  async function handleToggle(id) {
    setTogglingId(id)
    try {
      const res = await togglePublish(id)
      setStudies((prev) => prev.map((s) => s.id === id ? { ...s, published: res.published } : s))
    } catch (e) { alert(e.message) }
    finally { setTogglingId(null) }
  }

  async function handleLogout() {
    await logout()
    router.replace('/login')
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

  const published = studies.filter(s => s.published).length
  const drafts    = studies.length - published

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col z-20">
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-white">Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-800 text-white text-sm font-medium">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Estudos
          </div>
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Ver site público
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-2.5 mb-3">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full"/>
              : <div className="w-7 h-7 rounded-full bg-zinc-700"/>
            }
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
            Sair →
          </button>
        </div>
      </aside>

      {/* ── Conteúdo ── */}
      <div className="ml-56 flex-1">
        <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Estudos</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {published} publicado{published !== 1 ? 's' : ''} · {drafts} rascunho{drafts !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/admin/estudos/novo"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Novo estudo
          </Link>
        </div>

        <div className="px-8 py-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total',      value: studies.length, color: 'text-white' },
              { label: 'Publicados', value: published,      color: 'text-emerald-400' },
              { label: 'Rascunhos',  value: drafts,         color: 'text-zinc-400' },
            ].map((m) => (
              <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
                <p className="text-xs text-zinc-500 mb-1">{m.label}</p>
                <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {studies.length === 0 ? (
            <div className="border border-zinc-800 border-dashed rounded-2xl py-20 text-center">
              <p className="text-zinc-500 text-sm mb-1">Nenhum estudo criado ainda</p>
              <p className="text-zinc-600 text-xs mb-6">Comece criando seu primeiro estudo com gráficos</p>
              <Link href="/admin/estudos/novo"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl transition-colors">
                + Criar primeiro estudo
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-zinc-800 bg-zinc-800/50">
                <span className="col-span-5 text-xs text-zinc-500 font-medium uppercase tracking-wider">Título</span>
                <span className="col-span-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">Ticker</span>
                <span className="col-span-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</span>
                <span className="col-span-1 text-xs text-zinc-500 font-medium uppercase tracking-wider text-center">Graf.</span>
                <span className="col-span-2 text-xs text-zinc-500 font-medium uppercase tracking-wider text-right">Ações</span>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {studies.map((study) => (
                  <div key={study.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-zinc-800/20 transition-colors">
                    <div className="col-span-5 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{study.title}</p>
                      {study.description && <p className="text-xs text-zinc-500 truncate mt-0.5">{study.description}</p>}
                    </div>
                    <div className="col-span-2">
                      {study.ticker
                        ? <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">{study.ticker}</span>
                        : <span className="text-zinc-700 text-xs">—</span>
                      }
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
                        study.published
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${study.published ? 'bg-emerald-400' : 'bg-zinc-500'}`}/>
                        {study.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-sm text-zinc-400 font-mono">{study._count?.charts ?? 0}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button onClick={() => handleToggle(study.id)} disabled={togglingId === study.id}
                        title={study.published ? 'Despublicar' : 'Publicar'}
                        className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                          study.published
                            ? 'border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30'
                            : 'border-zinc-700 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}>
                        {study.published
                          ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                          : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        }
                      </button>
                      <Link href={`/admin/estudos/${study.id}`} title="Editar"
                        className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </Link>
                      <button onClick={() => handleDelete(study.id, study.title)} title="Deletar"
                        className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}