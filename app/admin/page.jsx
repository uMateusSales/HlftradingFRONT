'use client'
// app/admin/page.jsx
import { Suspense } from 'react'
import AdminContent from './AdminContent'

// Suspense wrapper obrigatório pelo Next.js quando useSearchParams() é usado
export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500 text-sm">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Carregando...
        </div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  )
}