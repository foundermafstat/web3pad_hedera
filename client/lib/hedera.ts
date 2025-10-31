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
      if (!this.dAppConnector) {
        this.currentSession = null;
        return false;
      }

      const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
      let disconnected = false;

      // Prefer targeted session delete when topic exists
      if (this.currentSession && walletConnectClient?.session) {
        const active = walletConnectClient.session.get(this.currentSession.topic);
        if (active) {
          try {
            await walletConnectClient.session.delete(this.currentSession.topic, { message: 'User disconnected' });
            disconnected = true;
          } catch (err) {
            console.warn('[HederaService] Failed targeted session delete, will fallback:', err);
          }
        }
      }

      // Fallback: attempt connector-wide disconnect, but guard errors
      if (!disconnected) {
        try {
          if (typeof this.dAppConnector.disconnectAll === 'function') {
            await this.dAppConnector.disconnectAll();
            disconnected = true;
          }
        } catch (err) {
          // Likely "No matching key" when topic already gone; safe to ignore
          console.log('[HederaService] No active session to disconnect');
        }
      }

      this.currentSession = null;

      // Best-effort cleanup of any remaining stale sessions
      try {
        await this.clearStaleSessions();
      } catch {}

      return disconnected;
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
      
      // Only disconnect if there's an active session (validate via client)
      if (this.hasActiveSession()) {
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
   * Try to recover session from WalletConnect client if currentSession is lost
   */
  hasActiveSession(): boolean {
    try {
      // First, try with currentSession if available
      if (this.dAppConnector && this.currentSession) {
        const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
        if (walletConnectClient?.session) {
          const session = walletConnectClient.session.get(this.currentSession.topic);
          if (session) {
            return true;
          }
        }
      }

      // If currentSession is lost, try to recover from WalletConnect client
      if (this.dAppConnector) {
        const walletConnectClient = (this.dAppConnector as any).walletConnectClient;
        if (walletConnectClient?.session) {
          // Get all active sessions
          const allSessions = walletConnectClient.session.getAll();
          if (allSessions && allSessions.length > 0) {
            // Use the first active session
            this.currentSession = allSessions[0];
            console.log('[HederaService] Recovered WalletConnect session:', this.currentSession.topic);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('[HederaService] Error checking active session:', error);
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

      // Use DAppConnector signTransaction method
      // WalletConnect expects base64 string or Transaction object, not array
      try {
        console.log('[HederaService] Preparing transaction for signing...');
        
        // Convert Uint8Array to base64 string (required by WalletConnect)
        // Using buffer conversion for large arrays to avoid stack overflow
        let base64String: string;
        
        if (transactionBytes.length < 10000) {
          // For smaller arrays, use simple conversion
          base64String = btoa(String.fromCharCode(...transactionBytes));
        } else {
          // For larger arrays, use chunking to avoid "Maximum call stack size exceeded"
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < transactionBytes.length; i += chunkSize) {
            const chunk = transactionBytes.slice(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          base64String = btoa(binary);
        }
        
        console.log('[HederaService] Transaction bytes prepared:', {
          originalLength: transactionBytes.length,
          base64Length: base64String.length,
          firstBytes: Array.from(transactionBytes.slice(0, 20)),
          lastBytes: Array.from(transactionBytes.slice(-20)),
          bytesHex: Array.from(transactionBytes.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join('')
        });

        // Use DAppConnector signTransaction method
        if (typeof this.dAppConnector.signTransaction !== 'function') {
          throw new Error('DAppConnector.signTransaction method not available');
        }

        console.log('[HederaService] Calling DAppConnector.signTransaction with base64 format:', {
          signerAccountId: fullAddress,
          base64Length: base64String.length,
          network: this.currentNetwork
        });
        
        // Call signTransaction with base64 string as transactionBody (required format)
        // According to WalletConnect Hedera spec, transactionBody must be base64 string
        let signResult: any;
        let lastError: any;
        
        // CRITICAL: WalletConnect expects the COMPLETE Transaction protobuf message
        // NOT just the TransactionBody - parameter name is misleading
        // Try transactionBody with base64 string (primary format - despite name, it expects full transaction)
        try {
          console.log('[HederaService] Attempting signTransaction with transactionBody parameter (full tx base64)...');
          signResult = await this.dAppConnector.signTransaction({
            signerAccountId: fullAddress,
            transactionBody: base64String,
          });
          console.log('[HederaService] Success with transactionBody format');
        } catch (error1: any) {
          lastError = error1;
          console.warn('[HederaService] transactionBody format failed:', error1.message);
          console.warn('[HederaService] Error details:', error1);
          
          // Fallback: try with transactionBytes (base64 string)
          try {
            console.log('[HederaService] Attempting signTransaction with transactionBytes (base64)...');
            signResult = await this.dAppConnector.signTransaction({
              signerAccountId: fullAddress,
              transactionBytes: base64String,
            });
            console.log('[HederaService] Success with transactionBytes (base64) format');
          } catch (error2: any) {
            lastError = error2;
            console.warn('[HederaService] transactionBytes (base64) format failed:', error2.message);
            
            // Last fallback: try passing transactionBytes as array (some implementations)
            try {
              console.log('[HederaService] Attempting signTransaction with transactionBytes (array)...');
              signResult = await this.dAppConnector.signTransaction({
                signerAccountId: fullAddress,
                transactionBytes: Array.from(transactionBytes),
              });
              console.log('[HederaService] Success with transactionBytes (array) format');
            } catch (error3: any) {
              lastError = error3;
              console.error('[HederaService] All formats failed. Full errors:', {
                error1: error1?.message,
                error2: error2?.message,
                error3: error3?.message
              });
              throw new Error(`All signing formats failed. Last error: ${error3.message}. Ensure transaction is base64 encoded.`);
            }
          }
        }

        console.log('[HederaService] Transaction signed successfully:', {
          hasResult: !!signResult,
          resultKeys: signResult ? Object.keys(signResult) : [],
          hasSignature: !!(signResult?.result?.signatureMap || signResult?.signatureMap || signResult?.signature),
          hasTransactionId: !!(signResult?.result?.transactionId || signResult?.transactionId),
          fullResult: signResult // Log full result to see what WalletConnect returns
        });
        
        // Log detailed structure to understand what WalletConnect returns
        console.log('[HederaService] Detailed signResult structure:', JSON.stringify(signResult, null, 2).substring(0, 1000));

        // Check if WalletConnect returned a fully signed transaction
        const signedTransactionBytes = signResult?.result?.signedTransaction || 
                                       signResult?.signedTransaction ||
                                       signResult?.result?.transactionBytes ||
                                       signResult?.transactionBytes ||
                                       null;

        // Extract signature in different formats that WalletConnect might return
        const signatureMap = signResult?.result?.signatureMap || signResult?.signatureMap || null;
        const signature = signResult?.result?.signature || signResult?.signature || null;
        
        console.log('[HederaService] Returning signature data:', {
          hasSignatureMap: !!signatureMap,
          signatureMapType: typeof signatureMap,
          hasSignature: !!signature,
          signatureType: typeof signature,
          hasSignedTransactionBytes: !!signedTransactionBytes,
          signResultKeys: Object.keys(signResult || {}),
          signResultResultKeys: Object.keys(signResult?.result || {})
        });
        
        // Prefer signatureMap, fallback to signature
        const primarySignature = signatureMap || signature;
        
        return {
          signature: primarySignature,
          signatureMap: signatureMap, // Include signatureMap separately if available
          accountId: accountId,
          transactionId: signResult?.result?.transactionId || signResult?.transactionId || '',
          walletType: 'walletconnect',
          network: this.currentNetwork,
          signedTransactionBytes: signedTransactionBytes // Include signed transaction bytes if available
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