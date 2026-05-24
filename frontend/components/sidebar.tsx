"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, TrendingUp, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/networth", label: "Net Worth", icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col bg-sidebar-bg md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">Budget Buddy</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-2 border-primary bg-sidebar-active text-white"
                  : "text-sidebar-muted hover:bg-sidebar-active hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">John Doe</p>
            <p className="truncate text-xs text-sidebar-muted">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
