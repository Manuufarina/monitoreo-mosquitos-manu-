'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Informe {
  id?: number
  fecha: string
  tipos: ('ovi' | 'adultos')[]
  cantidades?: {
    ovi?: { Anopheles?: number; Aedes?: number; Culex?: number }
    adultos?: { Anopheles?: number; Aedes?: number; Culex?: number }
  }
  notas?: string
  trampaId: number
}

interface InformesTrampasProps {
  direccion: string
  lat: number
  lng: number
  trampaId: number
  informesExistentes?: Informe[]
  onCancelar: () => void
  informeExistente?: Informe
  onGuardado: (informe: Informe) => void
}

export function InformesTrampas({
  direccion,
  lat,
  lng,
  trampaId,
  informesExistentes = [],
  onCancelar,
  informeExistente,
  onGuardado,
}: InformesTrampasProps) {
  const hoy = new Date().toISOString().split('T')[0]

  const [fecha, setFecha] = useState(informeExistente?.fecha.split('T')[0] || hoy)
  const [tipos, setTipos] = useState<('ovi' | 'adultos')[]>(informeExistente?.tipos || [])
  const [notas, setNotas] = useState(informeExistente?.notas || '')

  const [cantidadesOvi, setCantidadesOvi] = useState<{ [key: string]: string }>(
    informeExistente?.cantidades?.ovi || {}
  )
  const [cantidadesAdultos, setCantidadesAdultos] = useState<{ [key: string]: string }>(
    informeExistente?.cantidades?.adultos || {}
  )

  // 🔒 Cooldown state
  const [cooldown, setCooldown] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const startCooldown = () => {
    setCooldown(true)
    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setCooldown(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const toggleTipo = (valor: 'ovi' | 'adultos') => {
    setTipos((prev) =>
      prev.includes(valor) ? prev.filter((t) => t !== valor) : [...prev, valor]
    )
  }

  const handleGuardar = () => {
    if (cooldown) return // ✅ evita múltiples clicks

    if (!fecha || tipos.length === 0) {
      alert('Completá al menos la fecha y el tipo de trampa.')
      return
    }

    // Validación de duplicados
    const yaExiste = informesExistentes.some(
      (inf) =>
        inf.trampaId === trampaId &&
        inf.fecha.split('T')[0] === fecha &&
        inf.id !== informeExistente?.id
    )
    if (yaExiste) {
      alert('Ya existe un informe para esta dirección en esa fecha.')
      return
    }

    // limpiar y convertir cantidades
    const cleanOvi: Record<string, number> = {}
    Object.entries(cantidadesOvi).forEach(([k, v]) => {
      const n = Number(v)
      if (!Number.isNaN(n) && n > 0) cleanOvi[k] = n
    })

    const cleanAdultos: Record<string, number> = {}
    Object.entries(cantidadesAdultos).forEach(([k, v]) => {
      const n = Number(v)
      if (!Number.isNaN(n) && n > 0) cleanAdultos[k] = n
    })

    if (Object.keys(cleanOvi).length === 0 && Object.keys(cleanAdultos).length === 0) {
      alert('Debés ingresar al menos una cantidad válida')
      return
    }

    const payload: Informe = {
      id: informeExistente?.id,
      trampaId,
      fecha: new Date(fecha).toISOString(),
      tipos,
      cantidades: {
        ovi: cleanOvi,
        adultos: cleanAdultos,
      },
      notas,
    }

    console.log('📤 Payload preparado:', payload)
    onGuardado(payload)

    // ✅ activar cooldown después de guardar
    startCooldown()
  }

  const renderEspecieGrid = (grupo: 'ovi' | 'adultos') => {
    const especies = ['Anopheles', 'Aedes', 'Culex']
    const cantidades = grupo === 'ovi' ? cantidadesOvi : cantidadesAdultos
    const setCantidades = grupo === 'ovi' ? setCantidadesOvi : setCantidadesAdultos
    const anteriores = informeExistente?.cantidades?.[grupo] || {}

    return (
      <div className="grid grid-cols-3 gap-2 justify-center items-start">
        {especies.map((esp) => (
          <div key={`${grupo}-${esp}`} className="flex flex-col items-center">
            <Label>{esp}</Label>
            <Input
              type="number"
              value={cantidades[esp] || ''}
              onChange={(e) =>
                setCantidades((prev) => ({ ...prev, [esp]: e.target.value }))
              }
              className="w-16 text-center text-sm btn-fluor"
            />
            {anteriores[esp] && (
              <span className="text-xs text-gray-500 mt-1">
                Anterior: {anteriores[esp]}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto px-4">
      <div className="space-y-1 text-center">
        <Label className="text-sm font-medium">Dirección</Label>
        <p className="text-sm text-muted-foreground">{direccion}</p>
      </div>

      <div className="space-y-1 text-center">
        <Label className="text-sm font-medium">Fecha</Label>
        <Input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="mx-auto w-48 text-center bg-green-700 text-white rounded-md px-3 py-1"
        />
      </div>

      <div className="space-y-1 text-center">
        <Label className="text-sm font-medium">Tipo de trampa</Label>
        <div className="flex justify-center space-x-2">
          <Button
            className={`transition duration-200 ease-in-out active:scale-[0.98] ${
              tipos.includes('ovi')
                ? 'bg-green-900 text-white hover:bg-green-800'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            size="sm"
            onClick={() => toggleTipo('ovi')}
          >
            Ovi-Larvi-Trampas
          </Button>
          <Button
            className={`transition duration-200 ease-in-out active:scale-[0.98] ${
              tipos.includes('adultos')
                ? 'bg-green-900 text-white hover:bg-green-800'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            size="sm"
            onClick={() => toggleTipo('adultos')}
          >
            Trampa-Adultos
          </Button>
        </div>
      </div>

      {tipos.includes('ovi') && (
        <div className="space-y-1 text-center animate-fade-in-up">
          <Label className="text-sm font-medium">Ovi-Larvi-Trampas</Label>
          {renderEspecieGrid('ovi')}
        </div>
      )}

      {tipos.includes('adultos') && (
        <div className="space-y-1 text-center animate-fade-in-up">
          <Label className="text-sm font-medium">Trampa-Adultos</Label>
          {renderEspecieGrid('adultos')}
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-sm font-medium">Notas adicionales</Label>
        <Textarea
          placeholder="Observaciones..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      <div className="flex justify-between space-x-2">
        <Button
          variant="outline"
          onClick={onCancelar}
          disabled={cooldown} // opcional: también bloquea cancelar
          className="w-1/2 bg-green-900 text-white hover:bg-green-800 transition duration-200 ease-in-out active:scale-[0.98]"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={cooldown} // ✅ deshabilitado en cooldown
          className="w-1/2 bg-green-900 text-white hover:bg-green-800 transition duration-200 ease-in-out active:scale-[0.98]"
        >
          {cooldown
            ? `Reintentar en ${countdown}s`
            : informeExistente
              ? 'Actualizar informe'
              : 'Guardar informe'}
        </Button>
      </div>
    </div>
  )
}
