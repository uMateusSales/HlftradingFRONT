// components/Footer.jsx
// Footer reutilizável para todas as páginas públicas

import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030810]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4"/>
              </svg>
            </div>
            <span className="font-bold tracking-widest text-sm text-white">HLF</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <a href="mailto:hlftrading.trading@gmail.com" className="text-xs text-zinc-600 hover:text-cyan-400 font-mono tracking-widest transition-colors">
              Contato: hlftrading.trading@gmail.com
            </a>
       
          </nav>

          {/* Aviso */}
          <p className="text-xs text-zinc-700 font-mono text-center md:text-right">
            © {new Date().getFullYear()} HLF · <p>A metodologia de estudo apresentada neste site, não tem como objetivo, a recomendação e/ou sugestão de compra e  venda de ativos. O site possui caráter meramente informativo e educativo, deste modo, não nos responsabilizamos  por qualquer decisão que o usuário venha a tomar a partir das informações contidas neste site. Cada usuário é  exclusivamente responsável por seus investimentos e negociações no mercado, sendo assim, este site não pode ser  responsabilizado por prejuízos decorrentes dos investimentos e negociações feito pelo usuário. 
                                               A reprodução do conteúdo por parte do usuário é expressamente proibida.</p>

          </p>

        </div>

      </div>
    </footer>
  )
}