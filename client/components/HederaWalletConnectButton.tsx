'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import hederaService from '../lib/hedera';

interface HederaWalletConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function HederaWalletConnectButton({ 
  onSuccess, 
  onError,
  className = '',
  children
}: HederaWalletConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  
  // Get current network from service instead of local state
  const getCurrentNetwork = () => hederaService.getCurrentNetwork();

  const handleHederaSignIn = async (networkType: 'mainnet' | 'testnet' | null) => {
    setLoading(true);
    if (onError) onError('');
    
    try {
      // Use current network from service if no network specified
      const targetNetwork = networkType || hederaService.getCurrentNetwork();
      
      console.log(`Connecting to Hedera wallet (${targetNetwork})...`);
      
      // Initialize and connect to wallet
      await hederaService.init(targetNetwork);
      
      let walletData: any;
      try {
        walletData = await hederaService.connect();
      } catch (connectError: any) {
        // Handle proposal expired error
        if (connectError?.message?.includes('Proposal expired') || 
            connectError?.message?.includes('proposal expired')) {
          if (onError) onError('Connection request expired. Please try connecting again.');
          setLoading(false);
          return;
        }
        throw connectError;
      }
      
      if (!walletData) {
        if (onError) onError('Failed to connect Hedera wallet');
        setLoading(false);
        return;
      }
      
      console.log('Connected Hedera wallet:', walletData.address);
      
      // Sign authentication message
      const authData = await hederaService.signAuthMessage(walletData.address);
      
      if (!authData || !authData.signature || !authData.message) {
        if (onError) onError('Failed to sign authentication message');
        setLoading(false);
        return;
      }
      
      console.log('Authentication signature received');
      
      // Perform login through NextAuth
      const result = await signIn('hedera', {
        walletAddress: authData.address,
        signature: authData.signature,
        message: authData.message,
        network: authData.network,
        redirect: false,
      });
      
      if (result?.error) {
        if (onError) onError(`Hedera authentication error: ${result.error}`);
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error('Hedera authentication error:', err);
      
      // Provide specific error messages
      if (err?.message?.includes('Proposal expired') || 
          err?.message?.includes('proposal expired')) {
        if (onError) onError('Connection session expired. Please try again.');
      } else if (err?.message?.includes('User rejected') || 
                 err?.message?.includes('user rejected')) {
        if (onError) onError('Connection cancelled by user.');
      } else {
        if (onError) onError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {children ? (
        <Button
          type="button"
          variant="outline"
          className={className}
          onClick={() => handleHederaSignIn(null)}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Connecting...
            </span>
          ) : (
            children
          )}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className={className || "w-full"}
            onClick={() => handleHederaSignIn('mainnet')}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.328l7.377 3.68-2.717 1.37-4.66-2.332v4.665l-4.66 2.332L4.623 10.08 12 6.328zm0 9.344l4.66-2.332v-4.665l-4.66 2.332-4.66-2.332v4.665L12 15.672z" />
            </svg>
            Hedera Mainnet
          </Button>
          <Button
            type="button"
            variant="outline"
            className={className || "w-full"}
            onClick={() => handleHederaSignIn('testnet')}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.328l7.377 3.68-2.717 1.37-4.66-2.332v4.665l-4.66 2.332L4.623 10.08 12 6.328zm0 9.344l4.66-2.332v-4.665l-4.66 2.332-4.66-2.332v4.665L12 15.672z" />
            </svg>
            Hedera Testnet
          </Button>
        </div>
      )}
    </div>
  );
}
