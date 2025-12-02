// Procesar dirección (coordenadas + validación + guardado)
export const procesarDireccion = async (
  guardarUbicacion: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean }
  ) => Promise<boolean>,
  lat: number,
  lng: number,
  onLocationSelect: (lat: number, lng: number, address: string) => void,
  setFueraMapa: (val: boolean) => void
) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    )
    const data = await response.json()
    const addressObj = data.address

    if (!addressObj || !esZonaValida(addressObj)) {
      setFueraMapa(true)
      return false
    }

    const street =
      addressObj.road ||
      addressObj.pedestrian ||
      addressObj.street ||
      'Calle desconocida'
    const number = addressObj.house_number || 'S/N'
    const fullAddress = `${street} ${number}, ${addressObj.suburb || addressObj.city || ''}`

    const ok = await guardarDireccion(guardarUbicacion, fullAddress, lat, lng)
    if (ok) {
      const direccionFiltrada = filtrarCalleAltura(fullAddress)
      onLocationSelect(lat, lng, direccionFiltrada)
      setFueraMapa(false)
      return true
    }
    return false
  } catch (error) {
    console.error('Error al procesar dirección:', error)
    return false
  }
}
