'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MobileHeader } from '@/components/mobile-header'
import { Sidebar } from '@/components/sidebar'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isAuthRoute = pathname === '/login'

  if (isAuthRoute) {
    return <main className="min-h-screen bg-background px-4 py-10">{children}</main>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 bg-background pt-14 px-4 pb-4 md:ml-60 md:pt-0 md:p-8">{children}</main>
    </div>
  )
}