import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: { sessionId: string } }
) {
	try {
		const { sessionId } = await params;
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

		const response = await fetch(`${serverUrl}/api/game-sessions/sessions/${sessionId}`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch game session' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching game session:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

