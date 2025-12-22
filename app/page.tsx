'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useActualizar } from '@/hooks/useActualizar'

const MapaMapa = dynamic(() => import('@/components/vista-mapa').then(mod => mod.MapaMapa), {
  ssr: false,
  loading: () => <div className="p-6 text-muted-foreground">Cargando mapa...</div>,
})

const MapaMenu = dynamic(() => import('@/components/vista-menu').then(mod => mod.MapaMenu), {
  ssr: false,
  loading: () => <div className="p-6 text-muted-foreground">Cargando menú...</div>,
})

const VistaBusqueda = dynamic(() => import('@/components/vista-busqueda').then(mod => mod.VistaBusqueda), {
  ssr: false,
  loading: () => <div className="p-6 text-muted-foreground">Cargando búsqueda...</div>,
})

const VistaComplementos = dynamic(() => import('@/components/vista-complementos').then(mod => mod.VistaComplementos), {
  ssr: false,
  loading: () => <div className="p-6 text-muted-foreground">Cargando complementos...</div>,
})

export default function Page() {
  const [currentView, setCurrentView] = useState<'inicio' | 'mapa' | 'vista-busqueda' | 'vista-complementos'>('mapa')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [userRol, setUserRol] = useState('')
  const [usuarioActivo, setUsuarioActivo] = useState('')

  const { trampas, informes, recargarTrampas, recargarInformes, crearInforme, eliminarInforme } = useActualizar()

  const cargadoRef = useRef(false)
  useEffect(() => {
    if (!cargadoRef.current) {
      const rolGuardado = localStorage.getItem('rol')
      const usuarioGuardado = localStorage.getItem('usuario')
      if (rolGuardado && usuarioGuardado) {
        setUserRol(rolGuardado)
        setUsuarioActivo(usuarioGuardado)
        setIsLoggedIn(true)
      }
      recargarTrampas()
      recargarInformes()
      cargadoRef.current = true
    }
  }, [])

  const toggleLogin = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false)
      setUsername('')
      setPassword('')
      setLoginError('')
      setUserRol('')
      setUsuarioActivo('')
      localStorage.removeItem('rol')
      localStorage.removeItem('usuario')
    } else {
      setShowLoginForm((prev) => !prev)
    }
  }

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: username, password }),
      })
      const result = await res.json()
      if (result.success) {
        setIsLoggedIn(true)
        setShowLoginForm(false)
        setLoginError('')
        setUserRol(result.rol || '')
        setUsuarioActivo(result.usuario || '')
        localStorage.setItem('rol', result.rol || '')
        localStorage.setItem('usuario', result.usuario || '')
      } else {
        setLoginError(result.error || 'Usuario o contraseña incorrectos')
      }
    } catch (err) {
      console.error('❌ Error al validar credenciales:', err)
      setLoginError('Error al conectar con el servidor')
    }
  }

  // Agrupar informes por trampaId
  const informesPorTrampa: Record<number, any[]> = {}
  for (const inf of informes) {
    if (!informesPorTrampa[inf.trampaId]) informesPorTrampa[inf.trampaId] = []
    informesPorTrampa[inf.trampaId].push(inf)
  }

  // Especies por trampaId
  const especiesPorTrampa: Record<number, { Aedes: number; Culex: number; Anopheles: number }> = {}
  for (const inf of informes) {
    const id = inf.trampaId
    if (!especiesPorTrampa[id]) {
      especiesPorTrampa[id] = { Aedes: 0, Culex: 0, Anopheles: 0 }
    }
    const cantidades = inf.cantidades || {}
    const ovi = cantidades.ovi || {}
    const adultos = cantidades.adultos || {}
    especiesPorTrampa[id].Aedes += (ovi.Aedes || 0) + (adultos.Aedes || 0)
    especiesPorTrampa[id].Culex += (ovi.Culex || 0) + (adultos.Culex || 0)
    especiesPorTrampa[id].Anopheles += (ovi.Anopheles || 0) + (adultos.Anopheles || 0)
  }

  const totalRecords = informes.length
  const uniqueTrampas = new Set(informes.map((d) => d.trampaId)).size
  const culexCount = Object.values(especiesPorTrampa).reduce((acc, e) => acc + e.Culex, 0)
  const aedesCount = Object.values(especiesPorTrampa).reduce((acc, e) => acc + e.Aedes, 0)
  const anophelesCount = Object.values(especiesPorTrampa).reduce((acc, e) => acc + e.Anopheles, 0)

  const topSpecies = (() => {
    const speciesCount: Record<string, number> = {}
    for (const e of Object.values(especiesPorTrampa)) {
      speciesCount['Aedes'] = (speciesCount['Aedes'] || 0) + e.Aedes
      speciesCount['Culex'] = (speciesCount['Culex'] || 0) + e.Culex
      speciesCount['Anopheles'] = (speciesCount['Anopheles'] || 0) + e.Anopheles
    }
    return Object.entries(speciesCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
  })()

  const resumen = {
    totalRecords,
    uniqueTrampas,
    culexCount,
    aedesCount,
    anophelesCount,
    topSpecies,
    hasData: informes.length > 0,
  }

  // Wrappers para props
  const handleGuardarInforme = async (nuevo: any, informeAnterior?: any) => {
    const ok = await crearInforme(nuevo, informeAnterior)
    if (ok) await recargarInformes()
    return ok
  }

  const handleEliminarInforme = async (id: number) => {
    const ok = await eliminarInforme(id)
    if (ok) await recargarInformes()
    return ok
  }

  // Eliminar pin por dirección
  const handleEliminarPin = async (direccion: string) => {
    const res = await fetch('/api/trampas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direccion }),
    })
    if (res.ok) {
      await recargarTrampas()
      await recargarInformes()
      return true
    }
    return false
  }

  // Guardar ubicación (crear trampa) ✅ corregido
  const handleGuardarUbicacion = async (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ) => {
    const res = await fetch('/api/trampas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direccion, lat, lng, traps, ubicacion }), // 👈 ahora correcto
    })
    if (res.ok) {
      await recargarTrampas()
      return true
    }
    return false
  }

// Actualizar posición
const handleActualizarPosicion = async (id: string, nuevaLat: number, nuevaLng: number) => {
  const res = await fetch('/api/trampas', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nuevaLat, nuevaLng }), // id como string
  })
  if (res.ok) {
    await recargarTrampas()
    return true
  }
  return false
}


  // Actualizar descripción
const handleActualizarDescripcion = async (id: string, nuevaDescripcion: string) => {
  const res = await fetch('/api/trampas', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nuevaUbicacion: nuevaDescripcion }),
  })
  if (res.ok) {
    await recargarTrampas()
    return true
  }
  return false
}


  return (
    <div className="min-h-screen bg-background relative">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        isLoggedIn={isLoggedIn}
        onToggleLogin={toggleLogin}
        userRol={userRol}
      />

      {showLoginForm && !isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Iniciar sesión</h2>
            <Input
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLoginForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleLogin}>Ingresar</Button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'inicio' ? (
        <MapaMenu
          trampas={trampas}
          informesPorTrampa={informesPorTrampa}
          especiesPorTrampa={especiesPorTrampa}
          recargarTrampas={recargarTrampas}
          recargarInformes={recargarInformes}
          userRol={userRol}
          resumen={resumen}
        />
      ) : currentView === 'mapa' && isLoggedIn ? (
        <MapaMapa
          trampas={trampas}
          informesPorTrampa={informesPorTrampa}
          especiesPorTrampa={especiesPorTrampa}
          recargarTrampas={recargarTrampas}
          recargarInformes={recargarInformes}
          crearInforme={handleGuardarInforme}
          eliminarInforme={handleEliminarInforme}
          actualizarPosicion={handleActualizarPosicion}
          actualizarDescripcion={handleActualizarDescripcion} // ✅ ahora correcto
          eliminarPin={handleEliminarPin}
          guardarUbicacion={handleGuardarUbicacion}
          userRol={userRol}
        />
      ) : currentView === 'vista-busqueda' ? (
        <VistaBusqueda />
      ) : null}

      <div hidden={currentView !== 'vista-complementos' || !isLoggedIn}>
        <VistaComplementos
          userRol={userRol}
          isLoggedIn={isLoggedIn}
          usuario={usuarioActivo}
        />
      </div>
    </div>
  )
}
