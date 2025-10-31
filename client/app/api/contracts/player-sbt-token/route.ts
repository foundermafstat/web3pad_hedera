import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const addressParam = searchParams.get('address');

		if (!addressParam) {
			return NextResponse.json(
				{ success: false, error: 'Missing address parameter' },
				{ status: 400 }
			);
		}

		const address = decodeURIComponent(addressParam);
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		
		console.log('[API] Fetching SBT token for address:', address);

		const response = await fetch(`${serverUrl}/api/contracts/player/${address}/sbt-token`, {
			cache: 'no-store'
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[API] Server error:', response.status, errorText);
			throw new Error(`Server returned ${response.status}: ${errorText}`);
		}

		const data = await response.json();
		console.log('[API] SBT token data received:', data);
		return NextResponse.json(data);
	} catch (error) {
		console.error('[API] Error fetching SBT token:', error);
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : 'Failed to fetch SBT token' },
			{ status: 500 }
		);
	}
}

