import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin Middleware — strictly enforces role-based access
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude public assets and login page
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') ||
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Initialize Supabase with session cookie
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false, // Middleware is stateless
      }
    }
  );

  // 3. Get session from cookies
  // Note: Standard supabase-js requires significant boilerplate for Next.js 14 cookies
  // We'll use a simplified check for v1, assuming auth.getUser() handles validation.
  const token = request.cookies.get('sb-access-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Validate User & Role
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 5. Check user_profiles.role = 'admin' (Spec improvement 1)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    // Prevent non-admins from accessing the console
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
  }

  return NextResponse.next();
}

// Ensure middleware only runs on app routes
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
