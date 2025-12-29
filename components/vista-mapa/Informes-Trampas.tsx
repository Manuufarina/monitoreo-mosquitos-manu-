'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface InformeTrampaProps {
  trampaId: string
  informesExistentes: any[]
  informeExistente?: any | null
  onGuardado: (payload: any) => void
  operadores: { id: string; nombre: string; apellido: string }[]
}

export function InformesTrampas({
  trampaId,
  informesExistentes,
  informeExistente,
  onGuardado,
  operadores,
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

  const [cooldown, setCooldown] = useState(false)

  const startCooldown = () => {
    setCooldown(true)
    setTimeout(() => setCooldown(false), 3000)
  }

  const handleGuardar = () => {
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
    onGuardado(payload)

    // ✅ activar cooldown después de guardar
    startCooldown()
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">Informe de Trampa</h2>

      {/* Grupo */}
      <div>
        <Label>Grupo</Label>
        <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
          <option value="control">Control</option>
          <option value="intervencion">Intervención</option>
        </select>
      </div>

      {/* Fecha y hora */}
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

      {/* Ronda */}
      <div>
        <Label>Ronda de semana</Label>
        <select value={ronda} onChange={(e) => setRonda(e.target.value)}>
          <option value="semana1">Semana 1</option>
          <option value="semana2">Semana 2</option>
          <option value="semana3">Semana 3</option>
          <option value="semana4">Semana 4</option>
        </select>
      </div>

      {/* Operador */}
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

      {/* Ubicación */}
      <div>
        <Label>Ubicación</Label>
        <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
          <option value="interior">Interior</option>
          <option value="exterior">Exterior</option>
        </select>
      </div>

      {/* Clima */}
      <div>
        <Label>Condiciones climáticas</Label>
        <textarea value={clima} onChange={(e) => setClima(e.target.value)} />
      </div>

      {/* Fumigación */}
      <div>
        <Label>Registro de fumigación reciente</Label>
        <select value={fumigacion} onChange={(e) => setFumigacion(e.target.value)}>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>

      {/* Estado dispositivo */}
      <div>
        <Label>Estado del dispositivo</Label>
        <textarea value={estadoDispositivo} onChange={(e) => setEstadoDispositivo(e.target.value)} />
      </div>

      {/* Estado envase */}
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

      {/* Especies */}
      <h3 className="font-semibold">Especies</h3>
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
      <h3 className="font-semibold">Variables Entomológicas</h3>
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

      {/* Botón de guardar */}
      <div className="pt-4">
        <Button
          onClick={handleGuardar}
          disabled={cooldown}
          className={`w-full ${cooldown ? 'bg-gray-400' : 'bg-green-900 hover:bg-green-800'} text-white`}
        >
          {cooldown ? 'Guardando...' : 'Guardar informe'}
        </Button>
      </div>
    </div>
  )
}
