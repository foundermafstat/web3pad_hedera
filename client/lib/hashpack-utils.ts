/**
 * HashPack Wallet Integration Utilities
 * Provides interface to interact with HashPack wallet
 */

interface HashPackAccount {
  accountId: string;
  publicKey: string;
  network: string;
}

interface HashPackTransaction {
  bytes: Uint8Array;
  accountId: string;
  network: string;
}

interface HashPackSignature {
  signature: string;
  accountId: string;
  transactionId: string;
}

declare global {
  interface Window {
    hashpack?: {
      isConnected(): boolean;
      getAccount(): HashPackAccount | null;
      request(params: {
        method: string;
        params: any;
      }): Promise<any>;
      connect(): Promise<void>;
      disconnect(): Promise<void>;
    };
  }
}

export class HashPackUtils {
  private static instance: HashPackUtils;
  private hashpack: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.hashpack = (window as any).hashpack;
      console.log('🔧 HashPackUtils initialized:', {
        hashpackAvailable: !!this.hashpack,
        windowObject: typeof window,
        hashpackObject: this.hashpack
      });
    }
  }

  static getInstance(): HashPackUtils {
    if (!HashPackUtils.instance) {
      HashPackUtils.instance = new HashPackUtils();
    }
    return HashPackUtils.instance;
  }

  /**
   * Check if HashPack is available
   */
  isAvailable(): boolean {
    const available = typeof window !== 'undefined' && !!(window as any).hashpack;
    console.log('🔍 HashPack availability check:', {
      windowExists: typeof window !== 'undefined',
      hashpackExists: !!(window as any).hashpack,
      available: available
    });
    return available;
  }

  /**
   * Check if HashPack is connected
   */
  isConnected(): boolean {
    if (!this.isAvailable()) return false;
    return this.hashpack.isConnected();
  }

  /**
   * Get current account from HashPack
   */
  getCurrentAccount(): HashPackAccount | null {
    if (!this.isAvailable() || !this.isConnected()) return null;
    return this.hashpack.getAccount();
  }

  /**
   * Connect to HashPack wallet
   */
  async connect(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('HashPack wallet not found. Please install HashPack extension.');
    }

    try {
      await this.hashpack.connect();
    } catch (error) {
      throw new Error(`Failed to connect to HashPack: ${error.message}`);
    }
  }

  /**
   * Sign transaction with HashPack
   */
  async signTransaction(transactionBytes: Uint8Array, accountId: string, network: string = 'testnet'): Promise<HashPackSignature> {
    if (!this.isAvailable()) {
      throw new Error('HashPack wallet not found. Please install HashPack extension.');
    }

    if (!this.isConnected()) {
      throw new Error('HashPack wallet not connected. Please connect your wallet.');
    }

    const currentAccount = this.getCurrentAccount();
    if (!currentAccount) {
      throw new Error('No account found in HashPack. Please select an account.');
    }

    // Verify account matches
    if (currentAccount.accountId !== accountId) {
      throw new Error(`Account mismatch. Expected: ${accountId}, Found: ${currentAccount.accountId}`);
    }

    try {
      console.log('🔐 Signing transaction with HashPack:', {
        accountId,
        network,
        hasBytes: !!transactionBytes,
        bytesLength: transactionBytes.length
      });

      const result = await this.hashpack.request({
        method: 'hedera_signTransaction',
        params: {
          bytes: transactionBytes, // HashPack can handle Uint8Array directly
          accountId: accountId,
          network: network
        }
      });

      console.log('✅ HashPack signing result:', result);

      // Validate result structure
      if (!result) {
        throw new Error('Empty response from HashPack wallet');
      }

      // HashPack may return signature in different formats
      const signature = result.signature || result.signatureMap || result.signedTransaction?.signatureMap;
      const resultAccountId = result.accountId || result.account || accountId;
      const transactionId = result.transactionId || result.transaction?.transactionId || '';

      if (!signature) {
        console.error('❌ Invalid HashPack response structure:', result);
        throw new Error('Invalid signature response from HashPack wallet. Please try again.');
      }

      return {
        signature: typeof signature === 'string' ? signature : JSON.stringify(signature),
        accountId: resultAccountId,
        transactionId: transactionId
      };

    } catch (error: any) {
      console.error('❌ HashPack signing error:', error);
      
      // Handle specific error types
      if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('denied') || error.message?.includes('cancelled')) {
        throw new Error('Transaction signing cancelled by user');
      }
      
      if (error.message?.includes('timeout')) {
        throw new Error('Transaction signing timeout. Please try again.');
      }
      
      throw new Error(`Failed to sign transaction with HashPack: ${error.message || error.toString()}`);
    }
  }

  /**
   * Sign message with HashPack
   */
  async signMessage(message: string, accountId: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('HashPack wallet not found. Please install HashPack extension.');
    }

    if (!this.isConnected()) {
      throw new Error('HashPack wallet not connected. Please connect your wallet.');
    }

    try {
      const result = await this.hashpack.request({
        method: 'hedera_signMessage',
        params: {
          message: message,
          accountId: accountId
        }
      });

      return result.signature;

    } catch (error) {
      console.error('❌ HashPack message signing error:', error);
      throw new Error(`Failed to sign message with HashPack: ${error.message}`);
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('HashPack wallet not found. Please install HashPack extension.');
    }

    try {
      const result = await this.hashpack.request({
        method: 'hedera_getAccountBalance',
        params: {
          accountId: accountId
        }
      });

      return result.balance || 0;

    } catch (error) {
      console.error('❌ HashPack balance error:', error);
      throw new Error(`Failed to get account balance: ${error.message}`);
    }
  }

  /**
   * Disconnect from HashPack
   */
  async disconnect(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await this.hashpack.disconnect();
    } catch (error) {
      console.error('❌ HashPack disconnect error:', error);
    }
  }
}

// Export singleton instance
export const hashpackUtils = HashPackUtils.getInstance();
export default hashpackUtils;
