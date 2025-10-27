import { create } from 'ipfs-http-client';
import { getIPFSClientConfig, getIPFSUrl as getIPFSUrlFromConfig } from './ipfs-config';

// IPFS configuration for Filebase
const IPFS_CONFIG = getIPFSClientConfig();

// Create IPFS client
export const ipfs = create(IPFS_CONFIG);

// Upload file to IPFS
export async function uploadToIPFS(file: File | Blob): Promise<string> {
  try {
    const result = await ipfs.add(file);
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

// Upload JSON metadata to IPFS
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  try {
    const jsonString = JSON.stringify(metadata, null, 2);
    const result = await ipfs.add(jsonString);
    return result.path;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

// Get IPFS URL
export function getIPFSUrl(hash: string): string {
  return getIPFSUrlFromConfig(hash);
}

// Upload image and metadata for NFT
export async function uploadNFTAssets(
  imageFile: File,
  metadata: {
    name: string;
    description: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
    gameType?: string;
    gameStats?: any;
  }
): Promise<{ imageHash: string; metadataHash: string; imageUrl: string; metadataUrl: string }> {
  try {
    // Upload image
    const imageHash = await uploadToIPFS(imageFile);
    const imageUrl = getIPFSUrl(imageHash);

    // Create complete metadata
    const completeMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl,
      attributes: metadata.attributes,
      external_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
      background_color: '000000',
      animation_url: null,
      youtube_url: null,
      ...(metadata.gameType && { game_type: metadata.gameType }),
      ...(metadata.gameStats && { game_stats: metadata.gameStats }),
    };

    // Upload metadata
    const metadataHash = await uploadMetadataToIPFS(completeMetadata);
    const metadataUrl = getIPFSUrl(metadataHash);

    return {
      imageHash,
      metadataHash,
      imageUrl,
      metadataUrl,
    };
  } catch (error) {
    console.error('Error uploading NFT assets:', error);
    throw new Error('Failed to upload NFT assets');
  }
}

// Generate NFT metadata for game achievements
export function generateGameAchievementMetadata(
  achievement: {
    name: string;
    description: string;
    gameType: string;
    score: number;
    level: number;
    timestamp: number;
  }
) {
  return {
    name: achievement.name,
    description: achievement.description,
    attributes: [
      { trait_type: 'Game Type', value: achievement.gameType },
      { trait_type: 'Score', value: achievement.score },
      { trait_type: 'Level', value: achievement.level },
      { trait_type: 'Achievement Date', value: new Date(achievement.timestamp).toISOString() },
      { trait_type: 'Rarity', value: achievement.score > 1000 ? 'Legendary' : achievement.score > 500 ? 'Epic' : 'Rare' },
    ],
    gameType: achievement.gameType,
    gameStats: {
      score: achievement.score,
      level: achievement.level,
      timestamp: achievement.timestamp,
    },
  };
}

// Generate NFT metadata for game characters/items
export function generateGameItemMetadata(
  item: {
    name: string;
    description: string;
    gameType: string;
    itemType: 'character' | 'weapon' | 'powerup' | 'skin';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    stats?: Record<string, number>;
  }
) {
  const rarityColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };

  return {
    name: item.name,
    description: item.description,
    attributes: [
      { trait_type: 'Game Type', value: item.gameType },
      { trait_type: 'Item Type', value: item.itemType },
      { trait_type: 'Rarity', value: item.rarity },
      { trait_type: 'Background Color', value: rarityColors[item.rarity] },
      ...(item.stats ? Object.entries(item.stats).map(([key, value]) => ({
        trait_type: key.charAt(0).toUpperCase() + key.slice(1),
        value: value,
      })) : []),
    ],
    gameType: item.gameType,
    gameStats: {
      itemType: item.itemType,
      rarity: item.rarity,
      stats: item.stats || {},
    },
  };
}
