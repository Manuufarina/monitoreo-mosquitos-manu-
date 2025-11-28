'use client'

import { Button } from '@/components/ui/button'

interface ConfirmacionModalProps {
  mensaje: string
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmacionModal({
  mensaje,
  visible,
  onConfirm,
  onCancel,
}: ConfirmacionModalProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-blue-50 border border-blue-300 rounded-md p-6 w-[320px] space-y-4 shadow-xl">
        <p className="text-sm text-blue-900 font-medium text-center">{mensaje}</p>
        <div className="flex justify-center gap-2">
          <Button variant="destructive" onClick={onConfirm}>
            Sí, eliminar
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
