'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaGamepad, FaPlay, FaTrophy, FaUsers } from 'react-icons/fa';

interface ShooterGameInterfaceProps {
  onStartGame?: () => void;
  onViewLeaderboard?: () => void;
}

const ShooterGameInterface: React.FC<ShooterGameInterfaceProps> = ({ 
  onStartGame, 
  onViewLeaderboard 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FaGamepad className="w-5 h-5" />
          <CardTitle>Shooter Game Interface</CardTitle>
        </div>
        <CardDescription>
          Play and manage shooter games on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={onStartGame} className="flex items-center gap-2">
            <FaPlay className="w-4 h-4" />
            Start Game
          </Button>
          <Button variant="outline" onClick={onViewLeaderboard} className="flex items-center gap-2">
            <FaTrophy className="w-4 h-4" />
            Leaderboard
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded">
            <FaUsers className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">1,234</div>
            <div className="text-sm text-muted-foreground">Active Players</div>
          </div>
          <div className="text-center p-4 border rounded">
            <FaTrophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">567</div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Game Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>High Score</span>
              <Badge variant="secondary">12,345</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Score</span>
              <Badge variant="secondary">8,765</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShooterGameInterface;
