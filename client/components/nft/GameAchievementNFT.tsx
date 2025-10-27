'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaSpinner, FaTrophy, FaStar, FaBolt, FaGem } from 'react-icons/fa';
import { nftService } from '@/lib/nft-service';

interface GameAchievementNFTProps {
  gameType: string;
  score: number;
  level: number;
  sessionData: any;
  userAddress: string;
  privateKey: string;
  onMintSuccess?: (result: any) => void;
}

export default function GameAchievementNFT({
  gameType,
  score,
  level,
  sessionData,
  userAddress,
  privateKey,
  onMintSuccess,
}: GameAchievementNFTProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [achievement, setAchievement] = useState<any>(null);
  const [mintResult, setMintResult] = useState<any>(null);

  const generateAchievement = async () => {
    setIsGenerating(true);
    try {
      const achievementData = nftService.generateAchievementFromSession(
        gameType,
        score,
        level,
        sessionData
      );
      setAchievement(achievementData);
    } catch (error) {
      console.error('Error generating achievement:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const mintAchievement = async () => {
    if (!achievement) return;

    setIsMinting(true);
    try {
      // Set private key for this session
      nftService.setUserPrivateKey(privateKey);
      
      const result = await nftService.mintAchievementNFT(achievement, userAddress);
      setMintResult(result);
      onMintSuccess?.(result);
    } catch (error) {
      console.error('Error minting achievement:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const getAchievementIcon = (name: string) => {
    if (name.includes('Legendary')) return <FaGem className="h-8 w-8 text-yellow-500" />;
    if (name.includes('Master')) return <FaStar className="h-8 w-8 text-purple-500" />;
    if (name.includes('Rising')) return <FaBolt className="h-8 w-8 text-blue-500" />;
    return <FaTrophy className="h-8 w-8 text-green-500" />;
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

  const rarity = achievement?.score > 2000 ? 'legendary' : 
                 achievement?.score > 1000 ? 'epic' : 
                 achievement?.score > 500 ? 'rare' : 'common';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaTrophy className="h-5 w-5" />
          Game achievement
        </CardTitle>
        <CardDescription>
          Create an NFT based on your game achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Game</p>
            <p className="font-medium capitalize">{gameType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Score</p>
            <p className="font-medium">{score}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Level</p>
            <p className="font-medium">{level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rarity</p>
            <Badge className={getRarityColor(rarity)}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Achievement Preview */}
        {achievement && (
          <div className="space-y-3">
            <h4 className="font-medium">NFT preview</h4>
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3 mb-3">
                {getAchievementIcon(achievement.name)}
                <div>
                  <h5 className="font-semibold">{achievement.name}</h5>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Game type:</span>
                  <span className="font-medium capitalize">{achievement.gameType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Score:</span>
                  <span className="font-medium">{achievement.score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Level:</span>
                  <span className="font-medium">{achievement.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span className="font-medium">
                    {new Date(achievement.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {!achievement ? (
            <Button
              onClick={generateAchievement}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Generating achievement...
                </>
              ) : (
                'Generate achievement'
              )}
            </Button>
          ) : !mintResult ? (
            <Button
              onClick={mintAchievement}
              disabled={isMinting}
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
          ) : (
            <div className="text-center space-y-2">
              <div className="text-green-600 font-medium">
                NFT created successfully!
              </div>
              <div className="text-sm text-gray-600">
                Token ID: {mintResult.tokenId}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(mintResult.metadataUrl, '_blank')}
              >
                View metadata
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
