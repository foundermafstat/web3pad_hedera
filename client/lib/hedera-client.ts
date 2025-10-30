/**
 * Hedera Client for Frontend
 * Provides interface to interact with Hedera smart contracts
 */

interface SwapRate {
  hbarToHplayRate: number;
  bonusMultiplierMin: number;
  bonusMultiplierMax: number;
  dailyLimitHbar: number;
  faucetEnabled: boolean;
}

interface UserSwapInfo {
  dailyUsedHbar: number;
  lastSwapTimestamp: number;
  totalSwaps: number;
}

interface SwapResult {
  success: boolean;
  transactionId: string;
  hbarAmount: number;
  hplayAmount: number;
  timestamp: number;
}

class HederaClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '';
  }

  /**
   * Get current swap rate from FaucetManager contract
   */
  async getSwapRate(): Promise<SwapRate> {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/rate`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch swap rate');
      }
      
      return data.data;
    } catch (error) {
      // Return default values as fallback
      return {
        hbarToHplayRate: 500,
        bonusMultiplierMin: 100,
        bonusMultiplierMax: 150,
        dailyLimitHbar: 1000 * 10**8,
        faucetEnabled: true
      };
    }
  }

  /**
   * Get user swap information
   */
  async getUserSwapInfo(address: string): Promise<UserSwapInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/user/${address}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user swap info');
      }
      
      return data.data;
    } catch (error) {
      // Return default values as fallback
      return {
        dailyUsedHbar: 0,
        lastSwapTimestamp: 0,
        totalSwaps: 0
      };
    }
  }

  /**
   * Get HBAR balance for an account
   */
  async getHbarBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/balance/${address}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch HBAR balance');
      }
      
      return data.data.balance;
    } catch (error) {
      // Return mock balance as fallback
      return 100000000000; // 1000 HBAR in tinybars
    }
  }

  /**
   * Create swap transaction for user to sign
   */
  async createSwapTransaction(userAddress: string, hbarAmountTinybars: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          hbarAmount: hbarAmountTinybars / 100000000
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create swap transaction');
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submit signed transaction to execute swap
   */
  async submitSignedTransaction(
    signedTransaction: any, 
    userAddress: string, 
    hbarAmountTinybars: number,
    originalTransactionBytes?: Uint8Array
  ): Promise<SwapResult> {
    try {
      // Convert transaction bytes to array for JSON serialization if provided
      const transactionBytesArray = originalTransactionBytes 
        ? Array.from(originalTransactionBytes)
        : null;

      const response = await fetch(`${this.baseUrl}/api/swap/submit-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signedTransaction,
          userAddress,
          hbarAmount: hbarAmountTinybars / 100000000,
          originalTransactionBytes: transactionBytesArray
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit signed transaction');
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute swap transaction through FaucetManager contract
   */
  async swapHbarForHplay(userAddress: string, hbarAmountTinybars: number): Promise<SwapResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          hbarAmount: hbarAmountTinybars / 100000000, // Convert tinybars to HBAR
          signature: '', // Not needed for authenticated users
          message: ''
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to execute swap');
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mint Player SBT for a user
   */
  async mintPlayerSBT(userAddress: string, tokenUri?: string): Promise<{ transactionId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contracts/player-sbt/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress, tokenUri }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to mint Player SBT');
      }

      return { transactionId: data.data.transactionId };
    } catch (error) {
      throw error as Error;
    }
  }

  /**
   * Get token balance for an account
   */
  async getTokenBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/swap/token-balance/${address}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch token balance');
      }
      
      return data.data.balance;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contracts/system/stats`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch system stats');
      }
      
      return data.data;
    } catch (error) {
      return {
        gamesPlayed: 0,
        players: 0,
        rewardsDistributed: 0,
        poolBalance: 0,
        totalParticipants: 0,
        initialized: false
      };
    }
  }

  /**
   * Check if system is operational
   */
  async isSystemOperational(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contracts/system/operational`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to check system status');
      }
      
      return data.data.operational;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get player information
   */
  async getPlayerInfo(address: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contracts/player/${address}/info`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch player info');
      }
      
      return data.data;
    } catch (error) {
      return {
        hasSBT: false,
        stats: {
          totalGamesPlayed: 0,
          totalWins: 0,
          totalPoints: 0,
          totalLosses: 0,
          averageScore: 0,
          lastGameTimestamp: 0
        },
        nftCount: 0,
        hplayBalance: 0
      };
    }
  }
}

// Export singleton instance
export const hederaClient = new HederaClient();
export default hederaClient;
