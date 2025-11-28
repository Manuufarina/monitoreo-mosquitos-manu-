import { Card } from "@/components/ui/card"
import { Bug, MapPin, Calendar } from "lucide-react"

interface DataSummaryProps {
  totalRecords: number
  uniqueLocations: number
  culexCount: number
  aedesCount: number
  anophelesCount: number
  topSpecies: string
  hasData: boolean
}

export function DataSummary({
  totalRecords,
  uniqueLocations,
  culexCount,
  aedesCount,
  anophelesCount,
  topSpecies,
  hasData,
}: DataSummaryProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Resumen de Datos</h2>
          <p className="text-sm text-muted-foreground">Estadísticas de monitoreo actual</p>
        </div>

        <div className="space-y-4">
          <SummaryItem
            icon={<Bug className="w-4 h-4 text-primary" />}
            label="Total Registros"
            description="Muestras recolectadas"
            value={totalRecords}
            bg="bg-primary/30"
            text="text-primary"
          />

          <SummaryItem
            icon={<MapPin className="w-4 h-4 text-accent" />}
            label="Ubicaciones"
            description="Sitios monitoreados"
            value={uniqueLocations}
            bg="bg-accent/30"
            text="text-accent"
          />

          <SummaryItem
            icon={<img src="/ico/culex.ico" alt="Culex" className="w-7 h-7" />}
            label="Culex"
            description="Registros encontrados"
            value={culexCount}
            bg="bg-chart-1/20"
            text="text-chart-1"
          />

          <SummaryItem
            icon={<img src="/ico/aedes-.ico" alt="Aedes Icon" className="w-7 h-7" />}
            label="Aedes Aegypti"
            description="Registros encontrados"
            value={aedesCount}
            bg="bg-chart-3/20"
            text="text-chart-3"
          />

          <SummaryItem
            icon={<img src="/ico/Anopheles-.ico" alt="Anopheles Icon" className="w-7 h-7" />}
            label="Anopheles"
            description="Registros encontrados"
            value={anophelesCount}
            bg="bg-emerald-200"
            text="text-chart-3"
          />

          <SummaryItem
            icon={<Calendar className="w-4 h-4 text-chart-2" />}
            label="Última Muestra"
            description="Registro más reciente"
            value={hasData ? "Hoy" : "N/A"}
            bg="bg-chart-2/20"
            text="text-chart-2"
          />
        </div>

        {!hasData && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No hay datos registrados aún.
              <br />
              Selecciona una ubicación para comenzar.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

function SummaryItem({
  icon,
  label,
  description,
  value,
  bg,
  text,
}: {
  icon: React.ReactNode
  label: string
  description: string
  value: string | number
  bg: string
  text: string
}) {
  return (
    <div className={`flex items-center justify-between p-3 bg-muted rounded-lg`}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <span className={`text-lg font-bold ${text}`}>{value}</span>
    </div>
  )
}
