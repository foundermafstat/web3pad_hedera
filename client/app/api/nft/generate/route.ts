import { NextRequest, NextResponse } from 'next/server';
import { nftService } from '@/lib/nft-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, gameType, score, level, sessionData } = body;

    if (!gameType || score === undefined) {
      return NextResponse.json(
        { error: 'Game type and score are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'achievement':
        result = nftService.generateAchievementFromSession(
          gameType,
          score,
          level || 1,
          sessionData || {}
        );
        break;
      case 'item':
        result = nftService.generateItemFromSession(gameType, sessionData || {});
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid generation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating NFT data:', error);
    return NextResponse.json(
      { error: 'Failed to generate NFT data' },
      { status: 500 }
    );
  }
}

