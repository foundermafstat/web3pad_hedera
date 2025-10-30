/**
 * NFT Service for managing game NFTs
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  metadata: NFTMetadata;
  owner: string;
  createdAt: Date;
}

export interface MintNFTRequest {
  to: string;
  metadata: NFTMetadata;
  gameType: string;
}

export interface MintNFTResponse {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
}

class NFTService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  async getContracts() {
    try {
      const response = await fetch(`${this.baseUrl}/nft/contracts`);
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  async generateNFT(metadata: NFTMetadata) {
    try {
      const response = await fetch(`${this.baseUrl}/nft/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error('Failed to generate NFT');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating NFT:', error);
      throw error;
    }
  }

  async mintNFT(request: MintNFTRequest): Promise<MintNFTResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/nft/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mint NFT');
      }

      return await response.json();
    } catch (error) {
      console.error('Error minting NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getNFTsByOwner(owner: string): Promise<NFT[]> {
    try {
      const response = await fetch(`${this.baseUrl}/nft/owner/${owner}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      throw error;
    }
  }

  async getNFTById(id: string): Promise<NFT | null> {
    try {
      const response = await fetch(`${this.baseUrl}/nft/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch NFT');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching NFT:', error);
      throw error;
    }
  }

  // Helper method to create game achievement NFT metadata
  createGameAchievementMetadata(
    gameType: string,
    achievement: string,
    rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
  ): NFTMetadata {
    const rarityColors = {
      common: '#9CA3AF',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
    };

    return {
      name: `${gameType} Achievement: ${achievement}`,
      description: `A special achievement NFT earned in ${gameType} for ${achievement}`,
      image: `https://via.placeholder.com/400x400/${rarityColors[rarity].slice(1)}/FFFFFF?text=${encodeURIComponent(achievement)}`,
      attributes: [
        {
          trait_type: 'Game Type',
          value: gameType,
        },
        {
          trait_type: 'Achievement',
          value: achievement,
        },
        {
          trait_type: 'Rarity',
          value: rarity,
        },
        {
          trait_type: 'Earned Date',
          value: new Date().toISOString(),
        },
      ],
    };
  }
}

export const nftService = new NFTService();
