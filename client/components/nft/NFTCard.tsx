'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaExternalLinkAlt, FaCopy, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';

interface NFTCardProps {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  metadataUrl?: string;
  gameType?: string;
  gameStats?: any;
  onViewDetails?: () => void;
}

export default function NFTCard({
  tokenId,
  name,
  description,
  image,
  attributes,
  metadataUrl,
  gameType,
  gameStats,
  onViewDetails,
}: NFTCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const rarity = attributes.find(attr => attr.trait_type === 'Rarity')?.value as string;

  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-nft.svg';
          }}
        />
        {rarity && (
          <Badge 
            className={`absolute top-2 right-2 ${getRarityColor(rarity)}`}
          >
            {rarity}
          </Badge>
        )}
        {gameType && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            {gameType}
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate">{name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Token ID: {tokenId}</span>
          {metadataUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(metadataUrl)}
              className="h-6 px-2"
            >
              {copied ? (
                <FaCheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <FaCopy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* Attributes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attributes</h4>
          <div className="flex flex-wrap gap-1">
            {attributes.slice(0, 3).map((attr, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {attr.trait_type}: {attr.value}
              </Badge>
            ))}
            {attributes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{attributes.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Game Stats */}
        {gameStats && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Game stats</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {Object.entries(gameStats).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
              Details
            </Button>
          )}
          {metadataUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(metadataUrl, '_blank')}
              className="flex-1"
            >
              <FaExternalLinkAlt className="h-3 w-3 mr-1" />
              Metadata
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
