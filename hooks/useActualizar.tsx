'use client'

import { useContext } from 'react'
import { ActualizarContext } from './ActualizarProvider'

export function useActualizar() {
  const context = useContext(ActualizarContext)
  if (!context) {
    throw new Error('useActualizar debe usarse dentro de <ActualizarProvider>')
  }
  return context
}
