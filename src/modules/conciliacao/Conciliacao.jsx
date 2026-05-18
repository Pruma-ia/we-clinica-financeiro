'use client'
import ModuloStub from '../_stub/ModuloStub.jsx'

export default function Conciliacao() {
  return (
    <ModuloStub
      titulo="Conciliação bancária"
      descricao="Upload de extrato e cruzamento automático"
      todo={[
        'Upload CSV ou OFX com parsing automático',
        'Cruzamento por valor (±R$0,50) e data (±3 dias)',
        'Vinculação manual para não cruzados',
        'Confirmação marca conciliado=true',
      ]}
    />
  )
}
