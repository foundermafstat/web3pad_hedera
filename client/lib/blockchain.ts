/**
 * Blockchain Integration Service for Client
 * Handles communication with Blockchain blockchain through server API
 */

export interface BlockchainSessionData {
  blockchainEnabled: boolean;
  blockchainSessionId: string | null;
  playerAddresses: Record<string, string>;
  blockchainResults: Array<{
    playerId: string;
    sessionId: string;
    txId: string;
    resultHash: string;
  }>;
}

export interface BlockchainStatus {
  enabled: boolean;
  network: string;
  registryContract: string;
  shooterContract: string;
}

export interface TransactionStatus {
  success: boolean;
  status?: string;
  data?: any;
  error?: string;
}

export class BlockchainService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/blockchain';
  }

  /**
   * Get blockchain integration status
   */
  async getStatus(): Promise<BlockchainStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Failed to get blockchain status:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting blockchain status:', error);
      return null;
    }
  }

  /**
   * Set player blockchain address
   */
  async setPlayerAddress(
    roomId: string, 
    playerId: string, 
    address: string, 
    nftTokenId?: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/set-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          playerId,
          address,
          nftTokenId
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting player address:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/tx/${txId}/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get game session blockchain data
   */
  async getSessionData(roomId: string): Promise<BlockchainSessionData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/room/${roomId}/session-data`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Failed to get session data:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting session data:', error);
      return null;
    }
  }

  /**
   * Submit manual game result (for testing)
   */
  async submitResult(
    playerAddress: string,
    score: number,
    gameType: string,
    metadata?: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/submit-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerAddress,
          score,
          gameType,
          metadata
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting result:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Setup reward for session (admin only)
   */
  async setupReward(
    sessionId: string,
    playerAddress: string,
    amount: number,
    ftContract?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/setup-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          playerAddress,
          amount,
          ftContract
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting up reward:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Register game module (admin only)
   */
  async registerModule(moduleData: {
    name: string;
    description: string;
    version: string;
    contractAddress: string;
    category: string;
    minStake?: number;
    maxPlayers?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/register-module`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering module:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get registered game modules from registry
   */
  async getGameModules(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/game-modules`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting game modules:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Start a new game session
   */
  async startGameSession(
    playerAddress: string,
    gameType: string,
    nftTokenId?: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerAddress,
          gameType,
          nftTokenId
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting game session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get player game sessions
   */
  async getPlayerSessions(playerAddress: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/player/${playerAddress}/sessions`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting player sessions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get NFT tokens owned by player
   */
  async getPlayerNFTs(playerAddress: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/player/${playerAddress}/nfts`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting player NFTs:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create new NFT
   */
  async createNFT(nftData: {
    name: string;
    description: string;
    imageUrl?: string;
    traits?: any[];
    playerAddress: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/create-nft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nftData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating NFT:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get FT token balances for player
   */
  async getPlayerFTBalances(playerAddress: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/player/${playerAddress}/ft-balances`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting FT balances:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all FT tokens
   */
  async getFTTokens(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ft-tokens`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting FT tokens:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create new FT token
   */
  async createFTToken(tokenData: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    description?: string;
    imageUrl?: string;
    ownerAddress: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/create-ft-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating FT token:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Transfer FT tokens
   */
  async transferFTTokens(
    tokenId: string,
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/transfer-ft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          fromAddress,
          toAddress,
          amount
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error transferring FT tokens:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo(contractAddress: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contract/${contractAddress}/info`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting contract info:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Call contract function (read-only)
   */
  async callContractFunction(
    contractAddress: string,
    functionName: string,
    functionArgs: any[]
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contract/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress,
          functionName,
          functionArgs
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling contract function:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all contracts
   */
  async getContracts(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting contracts:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Export getContracts function
export const getContracts = () => blockchainService.getContracts();

export default blockchainService;
