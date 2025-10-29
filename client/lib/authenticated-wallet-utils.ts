/**
 * Authenticated Wallet Utilities
 * Provides interface to work with authenticated wallet from NextAuth session
 */

import { Session } from 'next-auth';

interface AuthenticatedWallet {
  address: string;
  network: string;
  type: string;
  isPrimary: boolean;
}

interface WalletAuthData {
  isAuthenticated: boolean;
  wallet: AuthenticatedWallet | null;
  canSignTransactions: boolean;
  walletType: string | null;
}

export class AuthenticatedWalletUtils {
  private static instance: AuthenticatedWalletUtils;

  static getInstance(): AuthenticatedWalletUtils {
    if (!AuthenticatedWalletUtils.instance) {
      AuthenticatedWalletUtils.instance = new AuthenticatedWalletUtils();
    }
    return AuthenticatedWalletUtils.instance;
  }

  /**
   * Get wallet data from NextAuth session
   */
  getWalletFromSession(session: Session | null): WalletAuthData {
    if (!session?.user) {
      return {
        isAuthenticated: false,
        wallet: null,
        canSignTransactions: false,
        walletType: null
      };
    }

    const user = session.user as any;
    const wallets = user.wallets || [];
    
    if (wallets.length === 0) {
      return {
        isAuthenticated: false,
        wallet: null,
        canSignTransactions: false,
        walletType: null
      };
    }

    // Get primary wallet or first wallet
    const primaryWallet = wallets.find((w: any) => w.isPrimary) || wallets[0];
    
    return {
      isAuthenticated: true,
      wallet: {
        address: primaryWallet.address,
        network: primaryWallet.network || 'testnet',
        type: primaryWallet.type || 'hedera',
        isPrimary: primaryWallet.isPrimary || false
      },
      canSignTransactions: true, // User is authenticated, so they can sign
      walletType: primaryWallet.type || 'hedera'
    };
  }

  /**
   * Check if user has authenticated wallet
   */
  hasAuthenticatedWallet(session: Session | null): boolean {
    const walletData = this.getWalletFromSession(session);
    return walletData.isAuthenticated && walletData.canSignTransactions;
  }

  /**
   * Get wallet address from session
   */
  getWalletAddress(session: Session | null): string | null {
    const walletData = this.getWalletFromSession(session);
    return walletData.wallet?.address || null;
  }

  /**
   * Get wallet network from session
   */
  getWalletNetwork(session: Session | null): string {
    const walletData = this.getWalletFromSession(session);
    return walletData.wallet?.network || 'testnet';
  }

  /**
   * Get wallet type from session
   */
  getWalletType(session: Session | null): string | null {
    const walletData = this.getWalletFromSession(session);
    return walletData.walletType;
  }

  /**
   * Check if wallet is Hedera type
   */
  isHederaWallet(session: Session | null): boolean {
    const walletType = this.getWalletType(session);
    return walletType === 'hedera';
  }

  /**
   * Get user display name from session
   */
  getUserDisplayName(session: Session | null): string {
    if (!session?.user) return '';
    return session.user.name || session.user.email || 'Unknown User';
  }

  /**
   * Create transaction signing context from session
   */
  createSigningContext(session: Session | null): {
    canSign: boolean;
    walletAddress: string | null;
    network: string;
    walletType: string | null;
    error?: string;
  } {
    const walletData = this.getWalletFromSession(session);
    
    if (!walletData.isAuthenticated) {
      return {
        canSign: false,
        walletAddress: null,
        network: 'testnet',
        walletType: null,
        error: 'Пользователь не авторизован через кошелек'
      };
    }

    if (!walletData.canSignTransactions) {
      return {
        canSign: false,
        walletAddress: walletData.wallet?.address || null,
        network: walletData.wallet?.network || 'testnet',
        walletType: walletData.walletType,
        error: 'Кошелек не поддерживает подпись транзакций'
      };
    }

    return {
      canSign: true,
      walletAddress: walletData.wallet?.address || null,
      network: walletData.wallet?.network || 'testnet',
      walletType: walletData.walletType,
    };
  }
}

// Export singleton instance
export const authenticatedWalletUtils = AuthenticatedWalletUtils.getInstance();
export default authenticatedWalletUtils;

