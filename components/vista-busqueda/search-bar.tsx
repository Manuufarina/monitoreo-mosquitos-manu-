'use client'

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SearchBarProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  console.log('✅ SearchBar montado')

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const mockAddresses = [
    { address: "Av. Libertador 16500, San Isidro", lat: -34.4708, lng: -58.5067 },
    { address: "Av. Centenario 1200, San Isidro", lat: -34.4689, lng: -58.5089 },
    { address: "Av. del Libertador 17000, San Isidro", lat: -34.4728, lng: -58.5045 },
    { address: "Blvd. Saenz Peña 900, San Isidro", lat: -34.4695, lng: -58.5078 },
    { address: "Av. Márquez 500, San Isidro", lat: -34.4712, lng: -58.5098 },
    { address: "Bulnes 351", lat: -34.5084983, lng: -58.5708489 },
    { address: "Bulnes 350", lat: -34.5086132, lng: -58.5709497 },
  ]

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setIsLoading(true)

    setTimeout(() => {
      const filtered = mockAddresses.filter((addr) =>
        addr.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(filtered)
      setIsLoading(false)
    }, 500)
  }

  const handleSelectAddress = (location: { address: string; lat: number; lng: number }) => {
    console.log("📍 Dirección seleccionada desde SearchBar:", location)
    setSearchQuery(location.address)
    setSuggestions([])
    onLocationSelect(location)
  }

  return (
    <Card className="p-6 border border-green-500">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Buscar Ubicación</h2>
          <p className="text-sm text-muted-foreground">
            Ingresa una dirección en San Isidro para comenzar el monitoreo
          </p>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ej: Bulnes 351"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Direcciones encontradas:</p>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSelectAddress(suggestion)}
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{suggestion.address}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
