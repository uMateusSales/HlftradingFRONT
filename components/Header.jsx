'use client'
// components/Header.jsx
// Header reutilizável — funciona em todas as páginas públicas
// "Área do Trader" dispara o fluxo OAuth do Google diretamente

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const NAV_LINKS = [
  { label: 'INÍCIO',           href: '/' },
  { label: 'ESTUDOS',          href: '/#estudos' },
]

export default function Header() {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Ticker tape ── */}
  

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#050a14]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-widest text-white group-hover:text-cyan-400 transition-colors">
              HLFTrading
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.label} href={item.href}
                  className={`px-4 py-1.5 text-xs font-bold tracking-widest border rounded transition-all duration-150 ${
                    active
                      ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5'
                      : 'text-zinc-400 border-transparent hover:text-cyan-400 hover:border-cyan-500/30'
                  }`}>
                  {item.label}
                </Link>
              )
            })}

            {/* Área do Trader — dispara OAuth direto */}
            <a href={`${API_URL}/api/auth/google`}
              className="ml-2 px-4 py-1.5 text-xs font-bold tracking-widest text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 rounded transition-all duration-150 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              ÁREA DO TRADER
            </a>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setOpen(!open)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}/>
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden border-t border-white/5 bg-[#050a14] px-6 py-3 space-y-1">
            {NAV_LINKS.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
                className="block py-2 text-xs font-bold tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors">
                {item.label}
              </Link>
            ))}
            <a href={`${API_URL}/api/auth/google`}
              className="block py-2 text-xs font-bold tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
              ÁREA DO TRADER →
            </a>
          </div>
        )}
      </header>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </>
  )
}

const TICKER_TAPE = [
  { s: 'PETR4',   v: '+2.34%' }, { s: 'VALE3',   v: '-0.87%' },
  { s: 'ITUB4',   v: '+1.12%' }, { s: 'BBDC4',   v: '+0.45%' },
  { s: 'ABEV3',   v: '-1.23%' }, { s: 'MGLU3',   v: '+3.78%' },
  { s: 'WEGE3',   v: '+0.91%' }, { s: 'RENT3',   v: '-0.34%' },
  { s: 'BTCUSDT', v: '+4.21%' }, { s: 'ETHUSDT', v: '+2.67%' },
  { s: 'IBOV',    v: '+0.78%' }, { s: 'S&P500',  v: '+0.33%' },
]