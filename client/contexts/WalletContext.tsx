'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import hederaService, { HederaWalletData } from '@/lib/hedera';
import { authenticatedWalletUtils } from '@/lib/authenticated-wallet-utils';

interface WalletState {
  isConnected: boolean;
  walletAddress: string | null;
  walletType: 'walletconnect' | 'hashpack' | 'blade' | 'yamgo' | null;
  network: 'mainnet' | 'testnet' | null;
  isInitialized: boolean;
  dAppConnector: any | null;
  currentSession: any | null;
}

interface WalletContextType extends WalletState {
  connectWallet: (network: 'mainnet' | 'testnet') => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signTransaction: (transactionBytes: Uint8Array, accountId: string) => Promise<any>;
  refreshWalletState: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletAddress: null,
    walletType: null,
    network: null,
    isInitialized: false,
    dAppConnector: null,
    currentSession: null,
  });

  // Initialize wallet state from session and localStorage
  useEffect(() => {
    const initializeWalletState = async () => {
      try {
        // Get wallet info from authenticated session
        const walletData = authenticatedWalletUtils.getWalletFromSession(session);
        
        if (walletData.isAuthenticated && walletData.wallet) {
          // Check if there's a saved WalletConnect session
          const savedNetwork = localStorage.getItem('hedera_wallet_network') as 'mainnet' | 'testnet' | null;
          const network = walletData.wallet.network === 'mainnet' ? 'mainnet' : 'testnet' || savedNetwork || 'testnet';
          
          // Initialize HederaService
          await hederaService.init(network);
          
          // Check for active WalletConnect session
          const hasActiveSession = hederaService.hasActiveSession();
          const sessionWalletAddress = hasActiveSession ? hederaService.getCurrentWalletAddress() : null;
          
          // Determine wallet type
          let walletType: WalletState['walletType'] = null;
          if (hasActiveSession && sessionWalletAddress === walletData.wallet.address) {
            walletType = 'walletconnect';
          } else if (typeof window !== 'undefined' && (window as any).hashpack) {
            walletType = 'hashpack';
          } else if (typeof window !== 'undefined' && (window as any).blade) {
            walletType = 'blade';
          }
          
          setWalletState({
            isConnected: true,
            walletAddress: walletData.wallet.address,
            walletType,
            network,
            isInitialized: true,
            dAppConnector: hasActiveSession ? (hederaService as any).dAppConnector : null,
            currentSession: hasActiveSession ? (hederaService as any).currentSession : null,
          });
        } else {
          setWalletState(prev => ({ ...prev, isInitialized: true }));
        }
      } catch (error) {
        console.error('[WalletContext] Error initializing wallet state:', error);
        setWalletState(prev => ({ ...prev, isInitialized: true }));
      }
    };

    initializeWalletState();
  }, [session]);

  const connectWallet = useCallback(async (network: 'mainnet' | 'testnet') => {
    try {
      // Check if already connected to avoid duplicate connections
      const walletDataFromSession = authenticatedWalletUtils.getWalletFromSession(session);
      
      if (walletDataFromSession.isAuthenticated && walletDataFromSession.wallet) {
        // Already authenticated - just sync state
        await hederaService.init(network);
        const hasActiveSession = hederaService.hasActiveSession();
        
        if (hasActiveSession) {
          localStorage.setItem('hedera_wallet_network', network);
          
          setWalletState({
            isConnected: true,
            walletAddress: walletDataFromSession.wallet.address,
            walletType: 'walletconnect',
            network,
            isInitialized: true,
            dAppConnector: (hederaService as any).dAppConnector,
            currentSession: (hederaService as any).currentSession,
          });
          return;
        }
      }
      
      // If not connected, perform new connection
      await hederaService.init(network);
      const walletData = await hederaService.connect();
      
      if (walletData) {
        localStorage.setItem('hedera_wallet_network', network);
        
        setWalletState({
          isConnected: true,
          walletAddress: walletData.address,
          walletType: 'walletconnect',
          network,
          isInitialized: true,
          dAppConnector: (hederaService as any).dAppConnector,
          currentSession: (hederaService as any).currentSession,
        });
      }
    } catch (error) {
      console.error('[WalletContext] Error connecting wallet:', error);
      throw error;
    }
  }, [session]);

  const disconnectWallet = useCallback(async () => {
    try {
      await hederaService.disconnect();
      localStorage.removeItem('hedera_wallet_network');
      
      setWalletState({
        isConnected: false,
        walletAddress: null,
        walletType: null,
        network: null,
        isInitialized: true,
        dAppConnector: null,
        currentSession: null,
      });
    } catch (error) {
      console.error('[WalletContext] Error disconnecting wallet:', error);
      throw error;
    }
  }, []);

  const signTransaction = useCallback(async (transactionBytes: Uint8Array, accountId: string) => {
    if (!walletState.isConnected || !walletState.walletAddress) {
      throw new Error('Wallet is not connected');
    }

    // Ensure hederaService is initialized with correct network
    if (walletState.network) {
      await hederaService.init(walletState.network);
      
      // Update state with current connector/session if changed
      const hasActiveSession = hederaService.hasActiveSession();
      if (hasActiveSession) {
        const dAppConnector = (hederaService as any).dAppConnector;
        const currentSession = (hederaService as any).currentSession;
        
        if (dAppConnector !== walletState.dAppConnector || currentSession !== walletState.currentSession) {
          setWalletState(prev => ({
            ...prev,
            dAppConnector,
            currentSession
          }));
        }
      }
    }

    // Use WalletConnect if available
    if (walletState.walletType === 'walletconnect') {
      return await hederaService.signTransaction(transactionBytes, accountId);
    }

    // Fallback to browser wallets
    throw new Error('WalletConnect session not available. Please reconnect wallet.');
  }, [walletState]);

  const refreshWalletState = useCallback(async () => {
    const walletData = authenticatedWalletUtils.getWalletFromSession(session);
    
    if (walletData.isAuthenticated && walletData.wallet) {
      const network = (walletData.wallet.network === 'mainnet' ? 'mainnet' : 'testnet') as 'mainnet' | 'testnet';
      
      try {
        await hederaService.init(network);
        const hasActiveSession = hederaService.hasActiveSession();
        const sessionWalletAddress = hasActiveSession ? hederaService.getCurrentWalletAddress() : null;
        
        let walletType: WalletState['walletType'] = null;
        if (hasActiveSession && sessionWalletAddress === walletData.wallet.address) {
          walletType = 'walletconnect';
        }
        
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          walletAddress: walletData.wallet?.address || null,
          walletType: walletType || prev.walletType,
          network,
          dAppConnector: hasActiveSession ? (hederaService as any).dAppConnector : prev.dAppConnector,
          currentSession: hasActiveSession ? (hederaService as any).currentSession : prev.currentSession,
        }));
      } catch (error) {
        console.error('[WalletContext] Error refreshing wallet state:', error);
      }
    }
  }, [session]);

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connectWallet,
        disconnectWallet,
        signTransaction,
        refreshWalletState,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

