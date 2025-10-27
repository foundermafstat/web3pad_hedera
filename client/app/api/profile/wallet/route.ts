import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { walletAddress } = body;

		// Call server API to update wallet address
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const response = await fetch(`${serverUrl}/api/profile/wallet`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${session.user.id}`, // Pass user ID for auth
			},
			body: JSON.stringify({
				userId: session.user.id,
				blockchainAddress: walletAddress,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Server error' }));
			return NextResponse.json(
				{ error: errorData.error || 'Failed to update wallet address' },
				{ status: response.status }
			);
		}

		const userData = await response.json();
		return NextResponse.json({
			success: true,
			user: userData,
		});
	} catch (error) {
		console.error('Error updating wallet address:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Call server API to remove wallet address
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const response = await fetch(`${serverUrl}/api/profile/wallet`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${session.user.id}`, // Pass user ID for auth
			},
			body: JSON.stringify({
				userId: session.user.id,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Server error' }));
			return NextResponse.json(
				{ error: errorData.error || 'Failed to remove wallet address' },
				{ status: response.status }
			);
		}

		const userData = await response.json();
		return NextResponse.json({
			success: true,
			user: userData,
		});
	} catch (error) {
		console.error('Error removing wallet address:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
