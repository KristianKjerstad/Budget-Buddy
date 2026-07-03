import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function withCopiedCookies(baseResponse: NextResponse, redirectResponse: NextResponse) {
  baseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })

  return redirectResponse
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  // Check if user has a session by looking for auth cookie
  const hasSession = request.cookies.has('sb-auth-token') || 
                     request.cookies.has('sb-xanfnzrljcxwidbvhgca-auth-token')

  const isLoginRoute = request.nextUrl.pathname === '/login'

  // Redirect unauthenticated users away from protected pages
  if (!hasSession && !isLoginRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from login page
  if (hasSession && isLoginRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}