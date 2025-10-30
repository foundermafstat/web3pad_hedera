'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaCoins, FaExchangeAlt, FaWallet, FaChartLine } from 'react-icons/fa';

interface FTInterfaceProps {
  onTransfer?: () => void;
  onViewBalance?: () => void;
}

const FTInterface: React.FC<FTInterfaceProps> = ({ 
  onTransfer, 
  onViewBalance 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FaCoins className="w-5 h-5" />
          <CardTitle>Fungible Token Interface</CardTitle>
        </div>
        <CardDescription>
          Manage game tokens and rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={onTransfer} className="flex items-center gap-2">
            <FaExchangeAlt className="w-4 h-4" />
            Transfer Tokens
          </Button>
          <Button variant="outline" onClick={onViewBalance} className="flex items-center gap-2">
            <FaWallet className="w-4 h-4" />
            View Balance
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded">
            <FaCoins className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">1,234.56</div>
            <div className="text-sm text-muted-foreground">Game Tokens</div>
          </div>
          <div className="text-center p-4 border rounded">
            <FaChartLine className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">+12.5%</div>
            <div className="text-sm text-muted-foreground">24h Change</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Token Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Symbol</span>
              <Badge variant="secondary">GAME</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Decimals</span>
              <Badge variant="secondary">18</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Supply</span>
              <Badge variant="secondary">1,000,000</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FTInterface;
