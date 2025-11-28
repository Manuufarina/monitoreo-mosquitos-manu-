'use client'

import { useEffect, useState } from 'react'
import { MapPin, Search, Settings, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shouldHideElemento } from '@/lib/permisos'

interface HeaderProps {
  currentView: 'inicio' | 'mapa' | 'vista-busqueda' | 'vista-complementos'
  onViewChange: (view: 'inicio' | 'mapa' | 'vista-busqueda' | 'vista-complementos') => void
  isLoggedIn: boolean
  onToggleLogin: () => void
  userRol: string
}

export function Header({
  currentView,
  onViewChange,
  isLoggedIn,
  onToggleLogin,
  userRol,
}: HeaderProps) {
  const [permisos, setPermisos] = useState<Record<string, any>>({})

  useEffect(() => {
    fetch('/api/permisos')
      .then(res => res.json())
      .then(data => setPermisos(data))
      .catch(err => console.error('Error al cargar permisos:', err))
  }, [])

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: '#205c40' }}>
              <img src="/ico/logo.ico" alt="Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Monitor de Mosquitos</h1>
              <p className="text-sm text-muted-foreground">San Isidro - Sistema de Vigilancia Entomológica</p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>San Isidro, Buenos Aires</span>
            </div>

            <div className="flex items-center space-x-2">
              {isLoggedIn && !shouldHideElemento(userRol, 'mapa-mapa', permisos) && (
                <Button
                  variant={currentView === 'mapa' ? 'default' : 'outline'}
                  onClick={() => onViewChange('mapa')}
                  size="sm"
                  style={{
                    backgroundColor: currentView === 'mapa' ? '#205c40' : 'transparent',
                    borderColor: '#205c40',
                    color: currentView === 'mapa' ? 'white' : '#205c40',
                  }}
                >
                  Mapa
                </Button>
              )}

              <Button
                variant={currentView === 'inicio' ? 'default' : 'outline'}
                onClick={() => onViewChange('inicio')}
                size="sm"
                style={{
                  backgroundColor: currentView === 'inicio' ? '#205c40' : 'transparent',
                  borderColor: '#205c40',
                  color: currentView === 'inicio' ? 'white' : '#205c40',
                }}
              >
                Menú
              </Button>

              <Button
                variant={currentView === 'vista-busqueda' ? 'default' : 'outline'}
                onClick={() => onViewChange('vista-busqueda')}
                size="sm"
                title="Buscar"
                style={{
                  backgroundColor: currentView === 'vista-busqueda' ? '#205c40' : 'transparent',
                  borderColor: '#205c40',
                  color: currentView === 'vista-busqueda' ? 'white' : '#205c40',
                }}
              >
                <Search className="w-4 h-4" />
              </Button>

              {isLoggedIn && !shouldHideElemento(userRol, 'complementos', permisos) && (
                <Button
                  variant={currentView === 'vista-complementos' ? 'default' : 'outline'}
                  onClick={() => onViewChange('vista-complementos')}
                  size="sm"
                  title="Complementos"
                  style={{
                    backgroundColor: currentView === 'vista-complementos' ? '#205c40' : 'transparent',
                    borderColor: '#205c40',
                    color: currentView === 'vista-complementos' ? 'white' : '#205c40',
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={onToggleLogin}
                title={isLoggedIn ? 'Cerrar sesión' : 'Iniciar sesión'}
                className="text-green-900 hover:bg-green-100 border border-green-400"
              >
                {isLoggedIn ? <LogOut className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                {isLoggedIn ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
