import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  subtitle?: string
  trend?: {
    value: number
    label?: string
    isPositive: boolean
  }
  valueColor?: "default" | "success" | "danger" | "primary"
}

export function StatCard({ label, value, subtitle, trend, valueColor = "default" }: StatCardProps) {
  const colorClasses = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-destructive",
    primary: "text-primary",
  }

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", colorClasses[valueColor])}>{value}</p>
      {subtitle && (
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      )}
      {trend && (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            trend.isPositive
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {trend.isPositive ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {trend.label || `${Math.abs(trend.value)}%`}
        </div>
      )}
    </div>
  )
}
