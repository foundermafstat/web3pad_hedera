import { NextRequest, NextResponse } from 'next/server';
import { nftService } from '@/lib/nft-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, userAddress, privateKey } = body;

    if (!userAddress || !privateKey) {
      return NextResponse.json(
        { error: 'User address and private key are required' },
        { status: 400 }
      );
    }

    // Set user private key
    nftService.setUserPrivateKey(privateKey);

    let result;

    switch (type) {
      case 'achievement':
        result = await nftService.mintAchievementNFT(data, userAddress);
        break;
      case 'item':
        result = await nftService.mintItemNFT(data, userAddress);
        break;
      case 'custom':
        const { name, description, imageFile, attributes, gameType, gameStats } = data;
        result = await nftService.mintCustomNFT(
          name,
          description,
          imageFile,
          attributes,
          userAddress,
          gameType,
          gameStats
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid NFT type' },
          { status: 400 }
        );
    }

    // Clear private key after use
    nftService.clearUserPrivateKey();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    return NextResponse.json(
      { error: 'Failed to mint NFT' },
      { status: 500 }
    );
  }
}

