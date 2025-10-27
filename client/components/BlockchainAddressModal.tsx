'use client';

import React, { useState, useEffect } from 'react';
import { blockchainService, BlockchainStatus } from '@/lib/blockchain';

interface BlockchainAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  playerId: string;
  playerName: string;
  onAddressSet?: (address: string, txId?: string) => void;
}

const BlockchainAddressModal: React.FC<BlockchainAddressModalProps> = ({
  isOpen,
  onClose,
  roomId,
  playerId,
  playerName,
  onAddressSet
}) => {
  const [address, setAddress] = useState('');
  const [nftTokenId, setNftTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBlockchainStatus();
    }
  }, [isOpen]);

  const loadBlockchainStatus = async () => {
    try {
      const status = await blockchainService.getStatus();
      setBlockchainStatus(status);
    } catch (error) {
      console.error('Error loading blockchain status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter a Blockchain address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await blockchainService.setPlayerAddress(
        roomId,
        playerId,
        address.trim(),
        nftTokenId ? parseInt(nftTokenId) : undefined
      );

      if (result.success) {
        onAddressSet?.(address.trim(), result.data?.txId);
        onClose();
      } else {
        setError(result.error || 'Error setting address');
      }
    } catch (error) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className=" rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Connect Blockchain Address
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Player: <span className="font-medium">{playerName}</span>
            </p>
            {blockchainStatus && (
              <div className={`text-xs px-2 py-1 rounded ${
                blockchainStatus.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                Blockchain: {blockchainStatus.enabled ? 'Connected' : 'Disconnected'}
                {blockchainStatus.enabled && (
                  <span className="ml-2">
                    ({blockchainStatus.network.includes('testnet') ? 'Testnet' : 'Mainnet'})
                  </span>
                )}
              </div>
            )}
          </div>

          {!blockchainStatus?.enabled && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-sm text-yellow-800">
                Blockchain integration disabled. Game results will be saved locally only.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Blockchain Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Blockchain address to receive rewards
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="nftTokenId" className="block text-sm font-medium text-gray-700 mb-2">
                NFT Token ID (optional)
              </label>
              <input
                type="number"
                id="nftTokenId"
                value={nftTokenId}
                onChange={(e) => setNftTokenId(e.target.value)}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                If you have an NFT to use in the game
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading || !address.trim()}
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAddressModal;
