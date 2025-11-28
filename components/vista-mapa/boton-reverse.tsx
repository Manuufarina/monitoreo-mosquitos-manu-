'use client'

import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BotonReverseProps {
  reverseActive: boolean
  onToggle: (active: boolean) => void
}

export function BotonReverse({ reverseActive, onToggle }: BotonReverseProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onToggle(!reverseActive)}
      className={`h-6 w-6 p-0 rounded-full border ${
        reverseActive
          ? 'bg-blue-500 text-white border-blue-600' // 🔵 zoom activo
          : 'bg-red-500 text-white border-red-600'   // 🔴 pin azul activo
      }`}
      title={reverseActive ? 'Modo zoom' : 'Modo pin azul'}
    >
      <MapPin className="h-4 w-4" />
    </Button>
  )
}
