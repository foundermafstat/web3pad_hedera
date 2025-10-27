// Demo NFT functions for testing without real blockchain
export interface MintNFTParams {
  recipient: string;
  tokenUri: string;
  memo?: string;
}

export interface GameAchievement {
  name: string;
  description: string;
  gameType: string;
  score: number;
  level: number;
  timestamp: number;
  imageFile?: File;
}

export interface GameItem {
  name: string;
  description: string;
  gameType: string;
  itemType: 'character' | 'weapon' | 'powerup' | 'skin';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: Record<string, number>;
  imageFile?: File;
}

// Demo mint NFT function (simulates blockchain transaction)
export async function mintNFT(
  params: MintNFTParams,
  privateKey: string
): Promise<{ txId: string; tokenId: number }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock transaction ID
  const txId = `0x${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`;
  const tokenId = Math.floor(Math.random() * 1000000);
  
  console.log('Demo NFT minted:', {
    txId,
    tokenId,
    recipient: params.recipient,
    tokenUri: params.tokenUri,
    memo: params.memo,
  });
  
  return { txId, tokenId };
}

// Demo contract address function
export function getContractAddress(contract: 'registry' | 'nft' | 'ft'): string {
  return `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.${contract}`;
}

// Demo utility functions
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidBlockchainAddress(address: string): boolean {
  const blockchainAddressRegex = /^[SM][0-9A-HJ-NP-Z]{38,39}$/;
  return blockchainAddressRegex.test(address);
}


