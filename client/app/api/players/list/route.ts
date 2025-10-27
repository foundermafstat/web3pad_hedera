import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
		const searchParams = request.nextUrl.searchParams;
		const limit = searchParams.get('limit') || '100';

		const response = await fetch(
			`${serverUrl}/api/players/list?limit=${limit}`,
			{ cache: 'no-store' }
		);

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch players list' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching players list:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

