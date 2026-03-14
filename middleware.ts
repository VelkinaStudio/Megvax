import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function ensureFocusParams(
  params: URLSearchParams,
  focusLevel: 'campaign' | 'adset' | 'ad',
  focusId: string,
) {
  if (!params.get('focusLevel')) params.set('focusLevel', focusLevel);
  if (!params.get('focusId')) params.set('focusId', focusId);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle campaign URL redirects
  const adSetMatch = pathname.match(/^\/app\/campaigns\/[^/]+\/adsets\/([^/]+)\/?$/);
  if (adSetMatch) {
    const target = request.nextUrl.clone();
    target.pathname = '/app/campaigns';
    ensureFocusParams(target.searchParams, 'adset', safeDecodeURIComponent(adSetMatch[1]));
    return NextResponse.redirect(target);
  }

  const adMatch = pathname.match(/^\/app\/campaigns\/[^/]+\/ads\/([^/]+)\/?$/);
  if (adMatch) {
    const target = request.nextUrl.clone();
    target.pathname = '/app/campaigns';
    ensureFocusParams(target.searchParams, 'ad', safeDecodeURIComponent(adMatch[1]));
    return NextResponse.redirect(target);
  }

  const campaignMatch = pathname.match(/^\/app\/campaigns\/([^/]+)\/?$/);
  if (campaignMatch) {
    const target = request.nextUrl.clone();
    target.pathname = '/app/campaigns';
    ensureFocusParams(target.searchParams, 'campaign', safeDecodeURIComponent(campaignMatch[1]));
    return NextResponse.redirect(target);
  }

  // Read locale from cookie, fallback to 'tr'
  const response = NextResponse.next();
  const locale = request.cookies.get('megvax-locale')?.value || 'tr';
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*$).*)', '/']
};
