'use client'

import { useEffect, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UserMenuProps = {
  className?: string
  textClassName?: string
  emailClassName?: string
  onAction?: () => void
}

type UserDetails = {
  displayName: string
  email: string
}

function getDisplayName(email: string, metadata?: Record<string, unknown>) {
  const fullName = typeof metadata?.full_name === 'string' ? metadata.full_name : null
  if (fullName && fullName.trim().length > 0) {
    return fullName
  }

  return email.split('@')[0] ?? 'Account'
}

export function UserMenu({
  className,
  textClassName,
  emailClassName,
  onAction,
}: UserMenuProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails>({
    displayName: 'Account',
    email: 'Signed in',
  })

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        return
      }

      setUserDetails({
        displayName: getDisplayName(user.email, user.user_metadata),
        email: user.email,
      })
    }

    void loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email

      if (!email) {
        setUserDetails({
          displayName: 'Account',
          email: 'Signed in',
        })
        return
      }

      setUserDetails({
        displayName: getDisplayName(email, session.user.user_metadata),
        email,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    setIsSigningOut(true)

    const supabase = createClient()
    await supabase.auth.signOut()

    onAction?.()
    router.replace('/login')
    router.refresh()
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90"
            aria-label="Open account menu"
          >
            <User className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-52">
          <DropdownMenuLabel>
            <div className="space-y-0.5">
              <p className="truncate font-medium">{userDetails.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{userDetails.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
            <LogOut className="h-4 w-4" />
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 overflow-hidden">
        <p className={textClassName}>{userDetails.displayName}</p>
        <p className={emailClassName}>{userDetails.email}</p>
      </div>
    </div>
  )
}