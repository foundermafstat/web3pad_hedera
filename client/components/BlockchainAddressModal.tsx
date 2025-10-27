'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { HederaNetworkSelector } from './HederaNetworkSelector';

interface BlockchainAddressModalProps {
  open: boolean;
  onClose: () => void;
  onAddressSubmit: (data: { address: string, type: string, network?: string }) => void;
}

export function BlockchainAddressModal({
  open,
  onClose,
  onAddressSubmit
}: BlockchainAddressModalProps) {
  const [address, setAddress] = useState('');
  const [addressType, setAddressType] = useState<'manual' | 'hedera'>('manual');
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError('Необходимо указать адрес');
      return;
    }

    onAddressSubmit({ 
      address, 
      type: addressType === 'manual' ? 'evm' : 'hedera',
      network: addressType === 'hedera' ? network : undefined 
    });
    onClose();
  };

  const handleHederaWalletConnect = (walletData: { address: string, network: 'mainnet' | 'testnet' }) => {
    setAddress(walletData.address);
    setNetwork(walletData.network);
    setAddressType('hedera');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить адрес блокчейна</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={addressType === 'manual' ? 'default' : 'outline'}
              onClick={() => setAddressType('manual')}
              className="flex-1"
            >
              EVM-совместимый
            </Button>
            <Button
              type="button"
              variant={addressType === 'hedera' ? 'default' : 'outline'}
              onClick={() => setAddressType('hedera')}
              className="flex-1"
            >
              Hedera
            </Button>
          </div>

          {addressType === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="blockchain-address" className="text-sm font-medium">
                  Адрес кошелька
                </label>
                <input
                  id="blockchain-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <Button type="submit" className="w-full">
                Добавить адрес
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <HederaNetworkSelector 
                onNetworkSelect={(network) => setNetwork(network)}
                onWalletConnect={handleHederaWalletConnect}
                onError={setError}
              />
              
              {address && (
                <div className="p-3 border rounded-md bg-background">
                  <p className="text-sm font-medium">Подключенный адрес:</p>
                  <p className="text-xs truncate">{address}</p>
                  <p className="text-xs text-muted-foreground">Сеть: {network}</p>
                </div>
              )}
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <Button 
                type="button" 
                className="w-full"
                onClick={handleSubmit}
                disabled={!address}
              >
                Добавить адрес Hedera
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}