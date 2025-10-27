'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaSpinner, FaUpload, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { nftService } from '@/lib/nft-service';

interface NFTMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  privateKey: string;
  gameType?: string;
  gameStats?: any;
}

interface Attribute {
  trait_type: string;
  value: string | number;
}

export default function NFTMintModal({
  isOpen,
  onClose,
  userAddress,
  privateKey,
  gameType,
  gameStats,
}: NFTMintModalProps) {
  const [nftData, setNftData] = useState({
    name: '',
    description: '',
    imageFile: null as File | null,
  });
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' });
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{
    txId: string;
    tokenId: number;
    metadataUrl: string;
  } | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNftData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setAttributes(prev => [...prev, {
        trait_type: newAttribute.trait_type,
        value: isNaN(Number(newAttribute.value)) ? newAttribute.value : Number(newAttribute.value),
      }]);
      setNewAttribute({ trait_type: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleMint = async () => {
    if (!nftData.name || !nftData.description || !nftData.imageFile) {
      alert('Please fill all fields and upload an image');
      return;
    }

    setIsMinting(true);
    try {
      // Set private key for this session
      nftService.setUserPrivateKey(privateKey);
      
      const result = await nftService.mintCustomNFT(
        nftData.name,
        nftData.description,
        nftData.imageFile,
        attributes,
        userAddress,
        gameType,
        gameStats
      );
      setMintResult(result);
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Error while creating NFT');
    } finally {
      setIsMinting(false);
    }
  };

  const handleClose = () => {
    setNftData({ name: '', description: '', imageFile: null });
    setAttributes([]);
    setNewAttribute({ trait_type: '', value: '' });
    setMintResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create NFT</CardTitle>
              <CardDescription>
                Create a unique NFT based on your game achievements
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <FaTimes className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {mintResult ? (
            <div className="text-center space-y-4">
              <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">NFT created successfully!</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Token ID:</strong> {mintResult.tokenId}</p>
                <p><strong>Transaction ID:</strong> {mintResult.txId}</p>
                <p><strong>Metadata URL:</strong> 
                  <a 
                    href={mintResult.metadataUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline ml-1"
                  >
                    Open
                  </a>
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic information</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">NFT name</Label>
                  <Input
                    id="name"
                    value={nftData.name}
                    onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter NFT name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={nftData.description}
                    onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your NFT"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <FaUpload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {nftData.imageFile ? nftData.imageFile.name : 'Click to upload image'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Attributes</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Attribute name"
                      value={newAttribute.trait_type}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, trait_type: e.target.value }))}
                    />
                    <Input
                      placeholder="Value"
                      value={newAttribute.value}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                    />
                    <Button onClick={addAttribute} size="sm">
                      Add
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Badge variant="secondary">
                        {attr.trait_type}: {attr.value}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttribute(index)}
                      >
                        <FaTimes className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Information */}
              {gameType && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Game information</h3>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p><strong>Game type:</strong> {gameType}</p>
                    {gameStats && (
                      <div className="mt-2">
                        <p><strong>Stats:</strong></p>
                        <pre className="text-xs text-gray-600 mt-1">
                          {JSON.stringify(gameStats, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mint Button */}
              <Button
                onClick={handleMint}
                disabled={isMinting || !nftData.name || !nftData.description || !nftData.imageFile}
                className="w-full"
              >
                {isMinting ? (
                  <>
                    <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                    Creating NFT...
                  </>
                ) : (
                  'Create NFT'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
