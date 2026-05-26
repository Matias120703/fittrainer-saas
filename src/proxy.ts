import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Public routes
  const publicRoutes = ['/', '/login', '/register']
  const isPublic = publicRoutes.includes(pathname)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname === '/login' || pathname === '/register')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (role === 'trainer') return NextResponse.redirect(new URL('/dashboard', request.url))
    if (role === 'client') return NextResponse.redirect(new URL('/home', request.url))
  }

  // Role-based route protection
  if (user) {
    const isTrainerRoute = pathname.startsWith('/dashboard') ||
      pathname.startsWith('/clients') ||
      pathname.startsWith('/routines') ||
      (pathname.startsWith('/chat') && !pathname.startsWith('/home')) ||
      pathname.startsWith('/calendar') ||
      pathname.startsWith('/settings')

    const isClientRoute = pathname.startsWith('/home') ||
      (pathname.startsWith('/routine') && !pathname.startsWith('/routines')) ||
      pathname.startsWith('/progress') ||
      pathname.startsWith('/messages') ||
      pathname.startsWith('/my-calendar')

    if (isTrainerRoute || isClientRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role

      if (isTrainerRoute && role !== 'trainer') {
        return NextResponse.redirect(new URL('/home', request.url))
      }
      if (isClientRoute && role !== 'client') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export default proxy

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
