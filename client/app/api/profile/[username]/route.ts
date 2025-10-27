import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET(
	request: NextRequest,
	{ params }: { params: { username: string } }
) {
	try {
		const { username } = params;

		const response = await fetch(`${SERVER_URL}/api/profile/${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Profile fetch error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch profile' },
			{ status: 500 }
		);
	}
}

