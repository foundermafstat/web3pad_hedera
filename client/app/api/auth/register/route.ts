import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password, username, displayName } = body;

		// Validate input
		if (!email || !password || !username || !displayName) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Forward to server
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const response = await fetch(`${serverUrl}/api/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password, username, displayName }),
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || 'Registration failed' },
				{ status: response.status }
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

