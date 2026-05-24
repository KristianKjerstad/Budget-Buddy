import { ReactNode } from "react"

interface SectionCardProps {
  title?: string
  children: ReactNode
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm">
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      )}
      {children}
    </div>
  )
}
