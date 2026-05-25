"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Receipt, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/user-menu"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/networth", label: "Net Worth", icon: TrendingUp },
]

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Header bar */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Budget Buddy</h1>
      </header>

      {/* Slide-out drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar-bg shadow-xl">
            {/* Header */}
            <div className="flex h-14 items-center justify-between px-4">
              <h1 className="text-lg font-bold text-white">Budget Buddy</h1>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
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
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
              <UserMenu
                className="flex items-center gap-3"
                textClassName="truncate text-sm font-medium text-white"
                emailClassName="truncate text-xs text-sidebar-muted"
                onAction={() => setIsOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
