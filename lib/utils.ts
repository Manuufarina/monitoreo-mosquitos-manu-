// 🎯 Roles y permisos
export function getRolesQuePuedeCrear(rol: string): string[] {
  const r = rol.toLowerCase()
  if (r === 'admin') return ['master', 'master-monitor-mosquitos', 'operario-monitor-mosquitos']
  if (r === 'master') return ['master-monitor-mosquitos', 'operario-monitor-mosquitos']
  if (r === 'master-monitor-mosquitos') return ['operario-monitor-mosquitos']
  return []
}

// 🎨 Utilidades de clase Tailwind
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
