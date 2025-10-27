'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaWallet, FaTrophy, FaBox, FaPlus, FaExternalLinkAlt, FaUpload } from 'react-icons/fa';
import { useWalletCheck } from '@/hooks/useWalletCheck';

// Dynamic imports to avoid SSR issues
const NFTCollection = React.lazy(() => import('./NFTCollection'));
const GameAchievementNFT = React.lazy(() => import('./GameAchievementNFT'));
const NFTTestComponent = React.lazy(() => import('./NFTTestComponent'));

export default function NFTPageClient() {
  const { isConnected, userAddress, privateKey } = useWalletCheck();
  const [activeTab, setActiveTab] = useState('collection');

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <FaWallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <CardTitle>Connect your wallet</CardTitle>
            <CardDescription>
              To use NFTs, please connect your Blockchain wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              Connect wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pt-16">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">NFT Collection</h1>
          <p className="text-gray-600">
            Create and manage your game NFTs
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">
              {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}
            </Badge>
           
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <FaBox className="h-4 w-4" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <FaTrophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <FaPlus className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <FaUpload className="h-4 w-4" />
              IPFS Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="space-y-4">
            <React.Suspense fallback={<div>Loading collection...</div>}>
              <NFTCollection
                userAddress={userAddress!}
                privateKey={privateKey!}
                onMintSuccess={(nft) => {
                  console.log('NFT minted successfully:', nft);
                }}
              />
            </React.Suspense>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <React.Suspense fallback={<div>Loading achievements...</div>}>
                {/* Shooter Achievement */}
                <GameAchievementNFT
                  gameType="shooter"
                  score={1250}
                  level={5}
                  sessionData={{ kills: 15, deaths: 3, accuracy: 0.75 }}
                  userAddress={userAddress!}
                  privateKey={privateKey!}
                  onMintSuccess={(result) => {
                    console.log('Achievement NFT minted:', result);
                  }}
                />

                {/* Race Achievement */}
                <GameAchievementNFT
                  gameType="race"
                  score={850}
                  level={3}
                  sessionData={{ time: 45.2, position: 1, laps: 3 }}
                  userAddress={userAddress!}
                  privateKey={privateKey!}
                  onMintSuccess={(result) => {
                    console.log('Achievement NFT minted:', result);
                  }}
                />

                {/* Tower Defence Achievement */}
                <GameAchievementNFT
                  gameType="towerdefence"
                  score={2000}
                  level={8}
                  sessionData={{ waves: 10, towers: 15, enemies: 150 }}
                  userAddress={userAddress!}
                  privateKey={privateKey!}
                  onMintSuccess={(result) => {
                    console.log('Achievement NFT minted:', result);
                  }}
                />
              </React.Suspense>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create NFT</CardTitle>
                <CardDescription>
                  Create a unique NFT based on your game achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-gray-500">
                    <FaBox className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">NFT creation</h3>
                    <p className="text-sm">
                      Use the "Collection" tab to create new NFTs
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('collection')}>
                    Go to collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <React.Suspense fallback={<div>Loading IPFS test...</div>}>
              <NFTTestComponent />
            </React.Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


