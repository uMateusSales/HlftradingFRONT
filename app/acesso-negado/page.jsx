'use client'
// app/acesso-negado/page.jsx
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AcessoNegadoPage() {
  return (
    <div className="min-h-screen bg-[#050a14] text-white flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden flex items-center justify-center">

        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(220,38,38,0.08),transparent)]"/>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#00d4ff 1px,transparent 1px),linear-gradient(90deg,#00d4ff 1px,transparent 1px)', backgroundSize: '60px 60px' }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative text-center px-6 max-w-lg">

          {/* Ícone */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8 mx-auto">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-red-500/30 bg-red-500/5 px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"/>
            <span className="text-xs text-red-400 font-mono tracking-widest">ACESSO RESTRITO</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            <span className="text-white">ÁREA</span>
            <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              NÃO AUTORIZADA
            </span>
          </h1>

          <p className="text-zinc-400 text-base mb-10 leading-relaxed">
            Você não tem permissão para acessar o painel administrativo.
            Esta área é restrita ao administrador do sistema.
          </p>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 font-bold text-sm tracking-widest rounded-xl transition-all duration-150">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              VOLTAR AO INÍCIO
            </Link>
          </div>

          {/* Linha decorativa */}
          <div className="mt-12 flex items-center gap-4 justify-center opacity-20">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-500"/>
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-500"/>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}