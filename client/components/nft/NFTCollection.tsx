'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FaSpinner, FaSearch, FaFilter, FaPlus, FaSync } from 'react-icons/fa';
import NFTCard from './NFTCard';
import NFTMintModal from './NFTMintModal';

interface NFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  metadataUrl?: string;
  gameType?: string;
  gameStats?: any;
}

interface NFTCollectionProps {
  userAddress: string;
  privateKey: string;
  onMintSuccess?: (nft: NFT) => void;
}

export default function NFTCollection({
  userAddress,
  privateKey,
  onMintSuccess,
}: NFTCollectionProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGameType, setFilterGameType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showMintModal, setShowMintModal] = useState(false);
  const [gameTypes, setGameTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);

  // Load NFTs (placeholder - would typically fetch from API)
  useEffect(() => {
    loadNFTs();
  }, [userAddress]);

  // Filter NFTs based on search and filters
  useEffect(() => {
    let filtered = nfts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Game type filter
    if (filterGameType !== 'all') {
      filtered = filtered.filter(nft => nft.gameType === filterGameType);
    }

    // Rarity filter
    if (filterRarity !== 'all') {
      filtered = filtered.filter(nft => {
        const rarity = nft.attributes.find(attr => attr.trait_type === 'Rarity')?.value;
        return rarity === filterRarity;
      });
    }

    setFilteredNfts(filtered);
  }, [nfts, searchTerm, filterGameType, filterRarity]);

  const loadNFTs = async () => {
    setIsLoading(true);
    try {
      // Placeholder data - replace with actual API call
      const mockNFTs: NFT[] = [
        {
          tokenId: 1,
          name: 'First Victory',
          description: 'Your first game victory in the arena',
          image: '/placeholder-nft.svg',
          attributes: [
            { trait_type: 'Game Type', value: 'shooter' },
            { trait_type: 'Rarity', value: 'common' },
            { trait_type: 'Score', value: 150 },
          ],
          gameType: 'shooter',
          gameStats: { score: 150, level: 1 },
        },
        {
          tokenId: 2,
          name: 'Legendary Warrior',
          description: 'A powerful warrior with legendary status',
          image: '/placeholder-nft.svg',
          attributes: [
            { trait_type: 'Game Type', value: 'shooter' },
            { trait_type: 'Rarity', value: 'legendary' },
            { trait_type: 'Score', value: 2500 },
            { trait_type: 'Level', value: 10 },
          ],
          gameType: 'shooter',
          gameStats: { score: 2500, level: 10 },
        },
      ];

      setNfts(mockNFTs);

      // Extract unique game types and rarities
      const uniqueGameTypes = [...new Set(mockNFTs.map(nft => nft.gameType).filter(Boolean))];
      const uniqueRarities = [...new Set(
        mockNFTs
          .map(nft => nft.attributes.find(attr => attr.trait_type === 'Rarity')?.value)
          .filter(Boolean)
      )];

      setGameTypes(uniqueGameTypes);
      setRarities(uniqueRarities);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintSuccess = (nft: NFT) => {
    setNfts(prev => [nft, ...prev]);
    onMintSuccess?.(nft);
    setShowMintModal(false);
  };

  const handleRefresh = () => {
    loadNFTs();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading NFTs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My NFT Collection</h2>
          <p className="text-gray-600">
            {filteredNfts.length} of {nfts.length} NFTs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <FaSync className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowMintModal(true)}>
            <FaPlus className="h-4 w-4 mr-2" />
            Create NFT
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Game type</label>
              <select
                value={filterGameType}
                onChange={(e) => setFilterGameType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All games</option>
                {gameTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rarity</label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All rarities</option>
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Grid */}
      {filteredNfts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <FaFilter className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No NFTs found</h3>
              <p className="text-sm">
                {nfts.length === 0 
                  ? 'You have no NFTs yet. Create your first NFT!'
                  : 'Try adjusting the search filters'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNfts.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              {...nft}
              onViewDetails={() => {
                // Handle view details
                console.log('View details for NFT:', nft.tokenId);
              }}
            />
          ))}
        </div>
      )}

      {/* Mint Modal */}
      <NFTMintModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        userAddress={userAddress}
        privateKey={privateKey}
        onMintSuccess={handleMintSuccess}
      />
    </div>
  );
}
