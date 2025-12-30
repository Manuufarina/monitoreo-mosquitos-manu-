'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface InformeTrampaProps {
  trampaId: string
  numero: number
  informesExistentes: any[]
  informeExistente?: any | null
  onGuardado: (payload: any) => void
  operadores: { id: string; nombre: string; nombreApellido?: string }[]
  onClose?: () => void
}

export function InformesTrampas({
  trampaId,
  numero,
  informesExistentes,
  informeExistente,
  onGuardado,
  operadores,
  onClose,
}: InformeTrampaProps) {
  const [grupo, setGrupo] = useState(informeExistente?.grupo ?? 'control')
  const [fecha, setFecha] = useState(informeExistente?.fecha?.split('T')[0] ?? '')
  const [hora, setHora] = useState(informeExistente?.hora ?? '')
  const [ronda, setRonda] = useState(informeExistente?.ronda ?? 'semana1')
  const [operador, setOperador] = useState(informeExistente?.operadorId ?? '')
  const [ubicacion, setUbicacion] = useState(informeExistente?.ubicacion ?? 'interior')
  const [clima, setClima] = useState(informeExistente?.clima ?? '')
  const [fumigacion, setFumigacion] = useState(informeExistente?.fumigacion ?? 'no')
  const [estadoDispositivo, setEstadoDispositivo] = useState(informeExistente?.estadoDispositivo ?? '')
  const [estadoEnvase, setEstadoEnvase] = useState(informeExistente?.estadoEnvase ?? 'correcto')

  // Variables entomológicas
  const [ovitrapPositiva, setOvitrapPositiva] = useState(informeExistente?.ovitrapPositiva ?? 'no')
  const [larvasPupas, setLarvasPupas] = useState(informeExistente?.larvasPupas ?? 'no')
  const [emergenciaAdultos, setEmergenciaAdultos] = useState(informeExistente?.emergenciaAdultos ?? 'no')
  const [cantidadAdultos, setCantidadAdultos] = useState(informeExistente?.cantidadAdultos ?? 0)

  // Especies
  const [anopheles, setAnopheles] = useState(informeExistente?.anopheles ?? 'negativo')
  const [aedes, setAedes] = useState(informeExistente?.aedes ?? 'negativo')
  const [culex, setCulex] = useState(informeExistente?.culex ?? 'negativo')

  // 🔒 Cooldown state con countdown
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

  const handleGuardar = async () => {
  if (cooldown) return // ✅ evita múltiples clicks

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

  const payload = {
    trampaId,
    grupo,
    fecha,
    hora,
    ronda,
    operadorId: operador,
    ubicacion,
    clima,
    fumigacion,
    estadoDispositivo,
    estadoEnvase,
    anopheles,
    aedes,
    culex,
    ovitrapPositiva,
    larvasPupas,
    emergenciaAdultos,
    cantidadAdultos,
  }

  console.log('📤 Payload preparado:', payload)

  try {
    const res = await fetch('/api/informes', {
      method: informeExistente ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    console.log('✅ Respuesta del backend:', data)

    if (!res.ok) {
      alert(data.error || 'Error al guardar informe')
    } else {
      alert('Informe guardado correctamente')
      if (onGuardado) onGuardado(data.informe) // opcional: actualizar estado en el padre
    }
  } catch (err) {
    console.error('❌ Error en fetch:', err)
    alert('No se pudo guardar el informe')
  }

  startCooldown()
}


  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-md">
      {/* Encabezado */}
      <div className="grid grid-cols-3 items-center mb-4">
        <h2 className="text-lg font-bold text-green-700">
          Informe de Trampa
        </h2>


        <span className="font-extrabold text-right">
          N°{numero}
        </span>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          <div>
            <Label>Grupo</Label>
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
              <option value="control">Control</option>
              <option value="intervencion">Intervención</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div>
              <Label>Fecha de visita</Label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <Label>Hora</Label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Ronda de semana</Label>
            <select value={ronda} onChange={(e) => setRonda(e.target.value)}>
              <option value="semana1">Semana 1</option>
              <option value="semana2">Semana 2</option>
              <option value="semana3">Semana 3</option>
              <option value="semana4">Semana 4</option>
            </select>
          </div>

          <div>
            <Label>Operador</Label>
            <select value={operador} onChange={(e) => setOperador(e.target.value)}>
              <option value="">Seleccione operador</option>
              {Array.isArray(operadores) &&
                operadores.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.nombre} {op.nombreApellido ?? ""}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label>Ubicación</Label>
            <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          <div>
            <Label>Condiciones climáticas</Label>
            <textarea value={clima} onChange={(e) => setClima(e.target.value)} />
          </div>

          <div>
            <Label>Registro de fumigación reciente</Label>
            <select value={fumigacion} onChange={(e) => setFumigacion(e.target.value)}>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <Label>Estado del dispositivo</Label>
            <textarea value={estadoDispositivo} onChange={(e) => setEstadoDispositivo(e.target.value)} />
          </div>

          <div>
            <Label>Estado del envase</Label>
            <select value={estadoEnvase} onChange={(e) => setEstadoEnvase(e.target.value)}>
              <option value="correcto">Correcto</option>
              <option value="volcado">Volcado</option>
              <option value="seco">Seco</option>
              <option value="roto">Roto</option>
              <option value="faltante">Faltante</option>
            </select>
          </div>
        </div>
      </div>

      {/* Especies */}
      <h3 className="font-semibold mt-6">Especies</h3>
      <div className="flex gap-4">
        <div>
          <Label>Anopheles</Label>
          <select value={anopheles} onChange={(e) => setAnopheles(e.target.value)}>
            <option value="positivo">Positivo</option>
            <option value="negativo">Negativo</option>
          </select>
        </div>
        <div>
          <Label>Aedes</Label>
          <select value={aedes} onChange={(e) => setAedes(e.target.value)}>
            <option value="positivo">Positivo</option>
            <option value="negativo">Negativo</option>
          </select>
        </div>
        <div>
          <Label>Culex</Label>
          <select value={culex} onChange={(e) => setCulex(e.target.value)}>
            <option value="positivo">Positivo</option>
            <option value="negativo">Negativo</option>
          </select>
        </div>
      </div>

      {/* Variables entomológicas */}
      <h3 className="font-semibold mt-6">Variables Entomológicas</h3>
      <div className="space-y-2">
        <div>
          <Label>Ovitrap positiva</Label>
          <select value={ovitrapPositiva} onChange={(e) => setOvitrapPositiva(e.target.value)}>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <Label>Presencia de larvas/pupas</Label>
          <select value={larvasPupas} onChange={(e) => setLarvasPupas(e.target.value)}>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <Label>Emergencia de adultos</Label>
          <select value={emergenciaAdultos} onChange={(e) => setEmergenciaAdultos(e.target.value)}>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
          {emergenciaAdultos === 'si' && (
            <input
              type="number"
              value={cantidadAdultos}
              onChange={(e) => setCantidadAdultos(Number(e.target.value))}
              placeholder="Cantidad"
              className="ml-2 w-24 border rounded px-2 py-1"
            />
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={cooldown}
          className="w-1/2 bg-red-600 text-white hover:bg-red-500 transition duration-200 ease-in-out active:scale-[0.98]"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={cooldown}
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
