import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { PeriodoProvider } from './components/layout/PeriodoBar.jsx'
import PeriodoBar from './components/layout/PeriodoBar.jsx'
import Sidebar from './components/layout/Sidebar.jsx'

import LoginPage from './modules/auth/LoginPage.jsx'
import AcessoNegado from './modules/auth/AcessoNegado.jsx'
import PainelAdmin from './modules/admin/PainelAdmin.jsx'

import Dashboard from './modules/dashboard/Dashboard.jsx'
import Lancamentos from './modules/lancamentos/Lancamentos.jsx'
import Comissoes from './modules/comissoes/Comissoes.jsx'
import ContasReceberPagar from './modules/contas/ContasReceberPagar.jsx'
import DRE from './modules/dre/DRE.jsx'
import FluxoCaixa from './modules/fluxoCaixa/FluxoCaixa.jsx'
import RelatorioVendas from './modules/vendas/RelatorioVendas.jsx'
import CicloFinanceiro from './modules/cicloFinanceiro/CicloFinanceiro.jsx'
import Conciliacao from './modules/conciliacao/Conciliacao.jsx'
import Clientes from './modules/clientes/Clientes.jsx'
import Prestadores from './modules/prestadores/Prestadores.jsx'
import PlanoContas from './modules/planoContas/PlanoContas.jsx'
import Premissas from './modules/premissas/Premissas.jsx'
import LogAuditoria from './modules/auditoria/LogAuditoria.jsx'

import { BG, SUB } from './constants/colors.js'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PeriodoProvider>
          <Root />
        </PeriodoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function Root() {
  const { loading, user, perfil } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: BG, color: SUB, fontSize: 14,
      }}>
        Carregando…
      </div>
    )
  }

  if (!user) return <LoginPage />
  if (!perfil) return <AcessoNegado />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar perfil={perfil} />
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <PeriodoBar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/lancamentos"  element={<Lancamentos />} />
          <Route path="/comissoes"    element={<Comissoes />} />
          <Route path="/contas"       element={<ContasReceberPagar />} />
          <Route path="/dre"          element={<DRE />} />
          <Route path="/fluxo-caixa"  element={<FluxoCaixa />} />
          <Route path="/vendas"       element={<RelatorioVendas />} />
          <Route path="/ciclo"        element={<CicloFinanceiro />} />
          <Route path="/conciliacao"  element={<Conciliacao />} />
          <Route path="/clientes"     element={<Clientes />} />
          <Route path="/prestadores"  element={<Prestadores />} />
          <Route path="/plano-contas" element={<PlanoContas />} />
          <Route path="/premissas"    element={<Premissas />} />
          <Route path="/auditoria"    element={<LogAuditoria />} />
          {perfil.role === 'admin' && (
            <Route path="/admin" element={<PainelAdmin />} />
          )}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
