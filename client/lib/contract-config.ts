/**
 * Contract Configuration for Client
 * Real deployed contract addresses on Hedera Testnet
 */

// Contract addresses mapping
export const CONTRACT_ADDRESSES = {
  // Ethereum-style addresses (0x...)
  GameRegistry: '0xda0cbeae027b044648386e4c27e20c18257c885a',
  TokenEconomy: '0x0c8f77d99ff0a20c4b5308abe24163c70c781963',
  LotteryPool: '0x9bb862643a73725e636dd7d7e30306844aa099f3',
  PlayerSBT: '0xfe9CF4dde9fBc14d61D26703354AA10414B35Ea6',
  NFTManager: '0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860',
  FaucetManager: '0xe334AfEc78B410C953A9bEa0Ff1E55F74bdeC212',
  ResultVerifier: '0xb1583369fe74fbf2d9b87b870fe67d6d0dc13b84',
  HederaGameLaunchpad: '0x54d13a05c632738674558f18de4394b7ee9a0399',

  // Hedera-style addresses (0.0...)
  GameRegistryHedera: '0.0.7153883',
  TokenEconomyHedera: '0.0.7153884',
  LotteryPoolHedera: '0.0.7153886',
  PlayerSBTHedera: '0.0.7153887',
  NFTManagerHedera: '0.0.7153888',
  FaucetManagerHedera: '0.0.7153889',
  ResultVerifierHedera: '0.0.7153890',
  HederaGameLaunchpadHedera: '0.0.7153891'
};

// Contract names mapping for easy access
export const CONTRACT_NAMES = {
  GAME_REGISTRY: 'GameRegistry',
  TOKEN_ECONOMY: 'TokenEconomy',
  LOTTERY_POOL: 'LotteryPool',
  PLAYER_SBT: 'PlayerSBT',
  NFT_MANAGER: 'NFTManager',
  FAUCET_MANAGER: 'FaucetManager',
  RESULT_VERIFIER: 'ResultVerifier',
  HEDERA_GAME_LAUNCHPAD: 'HederaGameLaunchpad'
};

// Helper function to get contract address by name
export function getContractAddress(contractName: string, useHederaFormat = false): string {
  const suffix = useHederaFormat ? 'Hedera' : '';
  const key = `${contractName}${suffix}`;
  
  if (!CONTRACT_ADDRESSES[key]) {
    throw new Error(`Contract address not found for ${contractName}`);
  }
  
  return CONTRACT_ADDRESSES[key];
}

// Helper function to get all contract addresses
export function getAllContractAddresses(useHederaFormat = false): Record<string, string> {
  const addresses: Record<string, string> = {};
  
  Object.values(CONTRACT_NAMES).forEach(contractName => {
    const suffix = useHederaFormat ? 'Hedera' : '';
    const key = `${contractName}${suffix}`;
    addresses[contractName] = CONTRACT_ADDRESSES[key];
  });
  
  return addresses;
}

// Network configuration
export const HEDERA_NETWORK_CONFIG = {
  testnet: {
    networkId: 'testnet',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    explorerUrl: 'https://hashscan.io/testnet',
    chainId: '0x128'
  },
  mainnet: {
    networkId: 'mainnet',
    mirrorNodeUrl: 'https://mainnet-public.mirrornode.hedera.com',
    explorerUrl: 'https://hashscan.io',
    chainId: '0x127'
  }
};

export default CONTRACT_ADDRESSES;
