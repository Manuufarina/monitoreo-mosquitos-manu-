'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Rangos() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <Card className="p-6 space-y-6 w-full max-w-md bg-white shadow-xl relative">
        <h2 className="text-lg font-semibold">Rangos</h2>
        <p>Gestión de rangos (crear, editar, borrar)</p>
        {/* Aquí podés integrar un componente ListaRangos */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => window.location.reload()}>Cerrar</Button>
        </div>
      </Card>
    </div>
  )
}
