import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { walletAddress, address, type, network, isPrimary } = body;

		// Use new wallet format if provided, otherwise use legacy walletAddress
		const walletData = address && type 
			? { userId: session.user.id, address, type, network, isPrimary: isPrimary || false }
			: { userId: session.user.id, address: walletAddress, type: 'hedera', network: 'testnet', isPrimary: true };

		// Call server API to add wallet
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const response = await fetch(`${serverUrl}/api/wallet/wallet`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(walletData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Server error' }));
			return NextResponse.json(
				{ error: errorData.error || 'Failed to update wallet address' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json({
			success: true,
			wallet: data.wallet,
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

		const body = await request.json().catch(() => ({}));
		const { walletId } = body;

		if (!walletId) {
			return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
		}

		// Call server API to remove wallet
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const response = await fetch(`${serverUrl}/api/wallet/wallet/${walletId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: session.user.id
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Server error' }));
			return NextResponse.json(
				{ error: errorData.error || 'Failed to remove wallet address' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error('Error removing wallet address:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
