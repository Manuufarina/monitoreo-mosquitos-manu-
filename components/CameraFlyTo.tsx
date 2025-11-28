import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface CameraFlyToProps {
  position: [number, number]
}

export function CameraFlyTo({ position }: CameraFlyToProps) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 17.5, {
        animate: true,
        duration: 2,
      })
    }
  }, [position, map])

  return null
}
