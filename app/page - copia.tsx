'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useActualizar } from '@/hooks/useActualizar'
import { BotonSubirPermisos } from '@/components/BotonSubirPermisos'


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

  const { trampas, informes, recargarTrampas, recargarInformes } = useActualizar()

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
      const res = await fetch('/api/validar-credenciales', {
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
        setLoginError('Usuario o contraseña incorrectos')
      }
    } catch (err) {
      console.error('❌ Error al validar credenciales:', err)
      setLoginError('Error al conectar con el servidor')
    }
  }

  const informesPorDireccion: Record<string, any[]> = {}
  for (const inf of informes) {
    if (!informesPorDireccion[inf.direccion]) informesPorDireccion[inf.direccion] = []
    informesPorDireccion[inf.direccion].push(inf)
  }

  const especiesPorDireccion: Record<string, { Aedes: number; Culex: number; Anopheles: number }> = {}
  for (const inf of informes) {
    const dir = inf.direccion
    if (!especiesPorDireccion[dir]) {
      especiesPorDireccion[dir] = { Aedes: 0, Culex: 0, Anopheles: 0 }
    }
    const cantidades = inf.cantidades || {}
    const ovi = cantidades.ovi || {}
    const adultos = cantidades.adultos || {}
    especiesPorDireccion[dir].Aedes += parseInt(ovi.Aedes || '0') + parseInt(adultos.Aedes || '0')
    especiesPorDireccion[dir].Culex += parseInt(ovi.Culex || '0') + parseInt(adultos.Culex || '0')
    especiesPorDireccion[dir].Anopheles += parseInt(ovi.Anopheles || '0') + parseInt(adultos.Anopheles || '0')
  }

  const totalRecords = informes.length
  const uniqueLocations = new Set(informes.map((d) => d.location?.address)).size
  const culexCount = informes.filter((d) => d.species === 'culex').length
  const aedesCount = informes.filter((d) => d.species === 'aedes-aegypti').length
  const anophelesCount = informes.filter((d) => d.species === 'anopheles').length

  const speciesCount = informes.reduce((acc, curr) => {
    acc[curr.species] = (acc[curr.species] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topSpecies = Object.entries(speciesCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
  const hasData = informes.length > 0

  const resumen = {
    totalRecords,
    uniqueLocations,
    culexCount,
    aedesCount,
    anophelesCount,
    topSpecies,
    hasData,
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
            <Input placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLoginForm(false)}>Cancelar</Button>
              <Button onClick={handleLogin}>Ingresar</Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* ✅ Botón para subir permisos.json */}
        <div className="mb-6">
          <BotonSubirPermisos />
        </div>

        {currentView === 'inicio' ? (
          <MapaMenu
            trampas={trampas}
            informesPorDireccion={informesPorDireccion}
            especiesPorDireccion={especiesPorDireccion}
            recargarTrampas={recargarTrampas}
            recargarInformes={recargarInformes}
            userRol={userRol}
            resumen={resumen}
          />
        ) : currentView === 'mapa' && isLoggedIn ? (
          <MapaMapa
            trampas={trampas}
            informesPorDireccion={informesPorDireccion}
            especiesPorDireccion={especiesPorDireccion}
            recargarTrampas={recargarTrampas}
            recargarInformes={recargarInformes}
            userRol={userRol}
          />
        ) : currentView === 'vista-busqueda' ? (
          <VistaBusqueda />
        ) : null}

        <div hidden={currentView !== 'vista-complementos' || !isLoggedIn}>
          <VistaComplementos userRol={userRol} isLoggedIn={isLoggedIn} usuario={usuarioActivo} />
        </div>
      </main>
    </div>
  )
}
