'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'

interface InicioViewProps {
  minimizado: boolean
  onMaximizar: () => void
  onMinimizar: () => void
}

export function InicioView({
  minimizado,
  onMaximizar,
  onMinimizar,
}: InicioViewProps) {
  if (minimizado) return null

  return (
    <Card className="bg-white/95 backdrop-blur-sm border shadow-lg w-80 p-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">Inicio</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={onMinimizar}
          className="h-5 w-5 p-0"
          title="Minimizar menú"
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>
      </div>

      {/* Podés agregar contenido adicional acá si querés que InicioView tenga otra función */}
      <p className="text-sm text-muted-foreground">
        Este panel ya no contiene el buscador. Usá el panel de direcciones en el mapa para buscar y crear informes.
      </p>
    </Card>
  )
}
