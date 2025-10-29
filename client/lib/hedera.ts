/**
 * Hedera Integration Service for Client
 * Simple integration with Hedera wallets via WalletConnect
 */

import { LedgerId } from '@hashgraph/sdk';

// Dynamic import to avoid SSR issues
let DAppConnector: any;
let HederaSessionEvent: any;
let HederaJsonRpcMethod: any;
let HederaChainId: any;

// Types for working with Hedera
export interface HederaWalletData {
  address: string;
  network: 'mainnet' | 'testnet';
  signature?: string;
  message?: string;
}

// Singleton class for Hedera integration
export class HederaService {
  private dAppConnector: any = null;
  private currentSession: any = null;
  private currentNetwork: 'mainnet' | 'testnet' = 'testnet';
  private projectId: string;
  
  constructor() {
    // Get projectId from environment variables
    this.projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
    if (!this.projectId) {
      console.error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in environment variables');
    }
  }

  /**
   * Initialize connection to Hedera
   */
  async init(network: 'mainnet' | 'testnet' = 'testnet'): Promise<boolean> {
    try {
      // Dynamic import to avoid SSR issues
      if (typeof window === 'undefined') {
        return false;
      }

      // Avoid re-initialization if already initialized
      if (this.dAppConnector) {
        console.log('[HederaService] DAppConnector already initialized, skipping re-init');
        return true;
      }

      if (!DAppConnector) {
        const hederaWcModule = await import('@hashgraph/hedera-wallet-connect');
        DAppConnector = hederaWcModule.DAppConnector;
        HederaSessionEvent = hederaWcModule.HederaSessionEvent;
        HederaJsonRpcMethod = hederaWcModule.HederaJsonRpcMethod;
        HederaChainId = hederaWcModule.HederaChainId;
      }

      this.currentNetwork = network;

      const metadata = {
        name: 'Web3Pad',
        description: 'Hedera Wallet Authentication',
        url: window.location.origin,
        icons: [`${window.location.origin}/icon.png`],
      };

      const ledgerId = network === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;
      const chainId = network === 'mainnet' ? HederaChainId.Mainnet : HederaChainId.Testnet;
      
      this.dAppConnector = new DAppConnector(
        metadata,
        ledgerId,
        this.projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [chainId],
      );

      await this.dAppConnector.init({ logger: 'error' });
      
      // DAppConnector has internal session management
      // No need for manual event listeners
      
      return true;
    } catch (error) {
      console.error('Error initializing Hedera:', error);
      return false;
    }
  }

  /**
   * Open wallet connection dialog
   */
  async connect(): Promise<HederaWalletData | null> {
    try {
      if (!this.dAppConnector) {
        await this.init(this.currentNetwork);
      }
      
      if (!this.dAppConnector) {
        throw new Error('Hedera Provider not initialized');
      }
      
      // Clear any stale sessions before opening new modal
      try {
        await this.clearStaleSessions();
      } catch (clearError) {
        console.log('No sessions to clear or already cleared');
      }
      
      const session = await this.dAppConnector.openModal();
      this.currentSession = session;
      
      // Get accounts from wallet connect client
      const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
      const accounts = walletConnectClient?.session?.get(session.topic)?.namespaces;
      
      if (accounts) {
        // Extract first Hedera account
        const hederaAccounts = accounts.hedera?.accounts || [];
        if (hederaAccounts.length > 0) {
          const accountId = hederaAccounts[0];
          console.log('Connected account:', accountId);
          return {
            address: accountId,
            network: this.currentNetwork
          };
        }
      }
      
      return null;
    } catch (error: any) {
      // Handle "Proposal expired" error specifically
      if (error?.message?.includes('Proposal expired') || error?.message?.includes('proposal expired')) {
        console.warn('Session expired, clearing and retrying...');
        await this.clearStaleSessions();
        
        // Retry connection after clearing
        try {
          const session = await this.dAppConnector.openModal();
          this.currentSession = session;
          
          const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
          const accounts = walletConnectClient?.session?.get(session.topic)?.namespaces;
          
          if (accounts) {
            const hederaAccounts = accounts.hedera?.accounts || [];
            if (hederaAccounts.length > 0) {
              const accountId = hederaAccounts[0];
              console.log('Connected account after retry:', accountId);
              return {
                address: accountId,
                network: this.currentNetwork
              };
            }
          }
        } catch (retryError) {
          console.error('Error retrying connection:', retryError);
        }
      }
      
      console.error('Error connecting Hedera wallet:', error);
      throw error; // Re-throw to let caller handle it
    }
  }
  
  /**
   * Clear any stale or expired sessions
   */
  private async clearStaleSessions(): Promise<void> {
    if (!this.dAppConnector) return;
    
    try {
      const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
      if (!walletConnectClient?.session) return;
      
      // Get all active sessions
      const sessions = walletConnectClient.session.getAll();
      
      // Disconnect all sessions
      for (const session of sessions) {
        try {
          await walletConnectClient.session.delete(session.topic, { message: 'Session expired' });
        } catch (err) {
          // Session might already be expired
          console.log('Session already expired or disconnected');
        }
      }
    } catch (error) {
      console.log('No sessions to clear');
    }
  }
  
  /**
   * Sign message for authentication
   */
  async signAuthMessage(address: string): Promise<HederaWalletData | null> {
    try {
      console.log('Signing message for address:', address);
      
      if (!this.dAppConnector) {
        throw new Error('DAppConnector not initialized');
      }
      
      if (!this.currentSession) {
        throw new Error('No active wallet session');
      }
      
      console.log('Current session:', this.currentSession);
      
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Authentication on Web3Pad: ${nonce}`;
      
      // Check if address is already in hedera format
      let fullAddress = address;
      if (!address.startsWith('hedera:')) {
        const networkPrefix = this.currentNetwork === 'mainnet' ? 'mainnet' : 'testnet';
        fullAddress = `hedera:${networkPrefix}:${address}`;
      }
      
      console.log('Full address for signing:', fullAddress);
      console.log('Message to sign:', message);
      
      const signResult = await this.dAppConnector.signMessage({
        signerAccountId: fullAddress,
        message,
      });
      
      console.log('Sign result:', signResult);
      
      const signature = signResult?.result?.signatureMap || signResult?.signatureMap || '';
      
      if (signature) {
        return {
          address,
          network: this.currentNetwork,
          signature,
          message
        };
      }
      
      console.warn('No signature received from wallet');
      return null;
    } catch (error) {
      console.error('Error signing message:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }
  }
  
  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<boolean> {
    try {
      // Clear all stale sessions first
      await this.clearStaleSessions();
      
      if (this.dAppConnector && this.currentSession) {
        // Disconnect all sessions only if there is an active session
        try {
          await this.dAppConnector.disconnectAll();
        } catch (error) {
          // Ignore if no active session
          console.log('No active session to disconnect');
        }
        this.currentSession = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
      return false;
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(network: 'mainnet' | 'testnet'): Promise<boolean> {
    try {
      if (this.currentNetwork === network) {
        return true;
      }
      
      // Only disconnect if there's an active session
      if (this.currentSession) {
        await this.disconnect();
      }
      
      // Update current network immediately
      this.currentNetwork = network;
      
      // Reinitialize if there's an active connector
      if (this.dAppConnector) {
        return await this.init(network);
      }
      
      return true;
    } catch (error) {
      console.error('Error switching Hedera network:', error);
      return false;
    }
  }

  /**
   * Validate Hedera address format
   */
  isValidHederaAddress(address: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(address);
  }

  /**
   * Get current network
   */
  getCurrentNetwork(): 'mainnet' | 'testnet' {
    return this.currentNetwork;
  }

  /**
   * Check if there's an active WalletConnect session
   */
  hasActiveSession(): boolean {
    if (!this.dAppConnector || !this.currentSession) {
      return false;
    }

    try {
      const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
      if (!walletConnectClient?.session) {
        return false;
      }

      // Check if session still exists
      const session = walletConnectClient.session.get(this.currentSession.topic);
      return !!session;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current connected wallet address from active session
   */
  getCurrentWalletAddress(): string | null {
    if (!this.hasActiveSession()) {
      return null;
    }

    try {
      const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
      if (!walletConnectClient?.session) {
        return null;
      }

      const session = walletConnectClient.session.get(this.currentSession.topic);
      if (!session) {
        return null;
      }

      const accounts = session.namespaces?.hedera?.accounts || [];
      if (accounts.length > 0) {
        // Extract address from format hedera:network:0.0.12345
        const accountId = accounts[0];
        if (accountId.includes(':')) {
          return accountId.split(':').slice(2).join(':');
        }
        return accountId;
      }

      return null;
    } catch (error) {
      console.error('Error getting current wallet address:', error);
      return null;
    }
  }

  /**
   * Sign transaction using active WalletConnect session
   */
  async signTransaction(transactionBytes: Uint8Array, accountId: string): Promise<any> {
    if (!this.hasActiveSession()) {
      throw new Error('No active WalletConnect session. Please connect wallet first.');
    }

    if (!this.dAppConnector) {
      throw new Error('DAppConnector not initialized');
    }

    try {
      console.log('[HederaService] Signing transaction via WalletConnect:', {
        accountId,
        network: this.currentNetwork,
        bytesLength: transactionBytes.length
      });

      // Check if address is already in full format
      let fullAddress = accountId;
      if (!accountId.startsWith('hedera:')) {
        const networkPrefix = this.currentNetwork === 'mainnet' ? 'mainnet' : 'testnet';
        fullAddress = `hedera:${networkPrefix}:${accountId}`;
      }

      console.log('[HederaService] Full address for signing:', fullAddress);

      // Use DAppConnector signTransaction method (similar to signMessage pattern)
      // Based on Hedera WalletConnect documentation, transactionBytes should be passed as Array
      try {
        console.log('[HederaService] Preparing transaction for signing...');
        
        // Convert Uint8Array to regular array for JSON serialization
        // This is the format expected by WalletConnect protocol
        const transactionBytesArray = Array.from(transactionBytes);
        
        console.log('[HederaService] Transaction bytes prepared:', {
          originalLength: transactionBytes.length,
          arrayLength: transactionBytesArray.length,
          firstBytes: transactionBytesArray.slice(0, 10),
          sample: transactionBytesArray.slice(0, 20)
        });

        // Use DAppConnector signTransaction method (same pattern as signMessage)
        if (typeof this.dAppConnector.signTransaction !== 'function') {
          throw new Error('DAppConnector.signTransaction method not available');
        }

        console.log('[HederaService] Calling DAppConnector.signTransaction with:', {
          signerAccountId: fullAddress,
          transactionBytesLength: transactionBytesArray.length,
          network: this.currentNetwork
        });
        
        // Call signTransaction with array format (standard for WalletConnect)
        const signResult = await this.dAppConnector.signTransaction({
          signerAccountId: fullAddress,
          transactionBytes: transactionBytesArray,
        });

        console.log('[HederaService] Transaction signed successfully:', {
          hasResult: !!signResult,
          resultKeys: signResult ? Object.keys(signResult) : [],
          hasSignature: !!(signResult?.result?.signatureMap || signResult?.signatureMap || signResult?.signature),
          hasTransactionId: !!(signResult?.result?.transactionId || signResult?.transactionId)
        });

        return {
          signature: signResult?.result?.signatureMap || signResult?.signatureMap || signResult?.signature || '',
          accountId: accountId,
          transactionId: signResult?.result?.transactionId || signResult?.transactionId || '',
          walletType: 'walletconnect',
          network: this.currentNetwork
        };
      } catch (error: any) {
        console.error('[HederaService] Transaction signing failed:', error);
        console.error('[HederaService] Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack?.substring(0, 200)
        });
        
        // Provide more helpful error message
        if (error?.message?.includes('timeout') || error?.message?.includes('expired')) {
          throw new Error('Запрос на подпись транзакции истек. Пожалуйста, попробуйте снова.');
        } else if (error?.message?.includes('rejected') || error?.message?.includes('denied')) {
          throw new Error('Подпись транзакции была отклонена пользователем.');
        } else if (error?.message?.includes('not connected') || error?.message?.includes('session')) {
          throw new Error('Кошелек не подключен. Пожалуйста, переподключите кошелек.');
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error('[HederaService] Error signing transaction via WalletConnect:', error);
      throw new Error(`Failed to sign transaction via WalletConnect: ${error.message || error.toString()}`);
    }
  }
}

// Export singleton
export const hederaService = new HederaService();
export default hederaService;