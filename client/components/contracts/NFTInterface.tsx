'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaImage, FaPlus, FaEye, FaDownload } from 'react-icons/fa';

interface NFTInterfaceProps {
  onMint?: () => void;
  onViewCollection?: () => void;
}

const NFTInterface: React.FC<NFTInterfaceProps> = ({ 
  onMint, 
  onViewCollection 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FaImage className="w-5 h-5" />
          <CardTitle>NFT Interface</CardTitle>
        </div>
        <CardDescription>
          Create, manage and trade game NFTs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={onMint} className="flex items-center gap-2">
            <FaPlus className="w-4 h-4" />
            Mint NFT
          </Button>
          <Button variant="outline" onClick={onViewCollection} className="flex items-center gap-2">
            <FaEye className="w-4 h-4" />
            View Collection
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded">
            <FaImage className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm text-muted-foreground">Total NFTs</div>
          </div>
          <div className="text-center p-4 border rounded">
            <FaDownload className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">23</div>
            <div className="text-sm text-muted-foreground">Minted Today</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Recent NFTs</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded" />
                <span className="text-sm">Game Achievement #123</span>
              </div>
              <Badge variant="secondary">Rare</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded" />
                <span className="text-sm">Player Badge #456</span>
              </div>
              <Badge variant="secondary">Common</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTInterface;
