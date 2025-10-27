import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { provider, providerId, email, name, image } = body;

		// Validate input
		if (!provider || !providerId || !email) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Forward to server
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const response = await fetch(`${serverUrl}/api/auth/oauth`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ provider, providerId, email, name, image }),
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || 'OAuth authentication failed' },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('OAuth error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

