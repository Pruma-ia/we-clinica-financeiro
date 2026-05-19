import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0D1B4B] via-[#162460] to-[#1E3080] flex items-center justify-center p-6 md:p-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[-10%] size-[480px] rounded-full bg-[#00AEEF]/10 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] size-[520px] rounded-full bg-[#5CCFF5]/8 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
      <footer className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/60">
        © We Clínica · Sistema Financeiro interno
      </footer>
    </main>
  )
}
