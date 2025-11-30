import { NextRequest, NextResponse, userAgent } from 'next/server'

export function proxy(request: NextRequest) {
	const url = request.nextUrl
	const { device } = userAgent(request)
	const viewport = device.type || 'desktop'
	console.log('🔍 Proxy Request:', {
		url: url.pathname,
		method: request.method,
		viewport: viewport,
		userAgent: request.headers.get('user-agent'),
		timestamp: new Date().toISOString()
	})

	url.searchParams.set('viewport', viewport)

	console.log('✅ Proxy Response:', {
		finalUrl: url.toString(),
		viewport: viewport
	})

	return NextResponse.rewrite(url)
}

export const config = {
	matcher: [
		'/api/:path*',
		'/((?!_next/static|_next/image|favicon.ico).*)'
	],
};
