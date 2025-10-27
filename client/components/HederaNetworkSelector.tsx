'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import hederaService from '../lib/hedera';

interface HederaNetworkSelectorProps {
  onNetworkSelect?: (network: 'mainnet' | 'testnet') => void;
  onWalletConnect?: (walletData: { address: string, network: 'mainnet' | 'testnet' }) => void;
  onError?: (error: string) => void;
}

export function HederaNetworkSelector({ 
  onNetworkSelect,
  onWalletConnect,
  onError
}: HederaNetworkSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [connecting, setConnecting] = useState(false);

  const handleNetworkChange = (network: 'mainnet' | 'testnet') => {
    setSelectedNetwork(network);
    if (onNetworkSelect) onNetworkSelect(network);
  };

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      // Инициализируем с выбранной сетью
      await hederaService.init(selectedNetwork);
      
      // Подключаемся к кошельку
      const walletData = await hederaService.connect();
      
      if (walletData && onWalletConnect) {
        onWalletConnect({
          address: walletData.address,
          network: selectedNetwork
        });
      }
    } catch (err) {
      console.error('Error connecting Hedera wallet:', err);
      if (onError) onError('Failed to connect Hedera wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium mb-2">Select Hedera Network:</span>
        <div className="flex space-x-2">
          <Button
            variant={selectedNetwork === 'mainnet' ? 'default' : 'outline'}
            className={selectedNetwork === 'mainnet' ? 'bg-primary' : ''}
            onClick={() => handleNetworkChange('mainnet')}
          >
            Mainnet
          </Button>
          <Button
            variant={selectedNetwork === 'testnet' ? 'default' : 'outline'}
            className={selectedNetwork === 'testnet' ? 'bg-primary' : ''}
            onClick={() => handleNetworkChange('testnet')}
          >
            Testnet
          </Button>
        </div>
      </div>
      
      <Button
        className="w-full"
        onClick={handleConnectWallet}
        disabled={connecting}
      >
        {connecting ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            Connecting...
          </span>
        ) : (
          <>Connect Hedera Wallet</>
        )}
      </Button>
    </div>
  );
}
