import { NextResponse } from 'next/server';
import { nftService } from '@/lib/nft-service';

export async function GET() {
  try {
    const contracts = nftService.getContractAddresses();
    
    return NextResponse.json({
      success: true,
      data: contracts,
    });
  } catch (error) {
    console.error('Error getting contract addresses:', error);
    return NextResponse.json(
      { error: 'Failed to get contract addresses' },
      { status: 500 }
    );
  }
}

