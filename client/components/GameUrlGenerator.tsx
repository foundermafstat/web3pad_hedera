'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaCopy, FaCheck, FaGamepad, FaExternalLinkAlt, FaQrcode } from 'react-icons/fa';
import GameQRGenerator from './GameQRGenerator';

interface GameUrlGeneratorProps {
  onGameCreated?: (gameUrl: string) => void;
}

const GameUrlGenerator: React.FC<GameUrlGeneratorProps> = ({ onGameCreated }) => {
  const [gameUrl, setGameUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  const generateGameUrl = () => {
    setIsGenerating(true);
    
    // Generate random game URL
    const adjectives = ['epic', 'legendary', 'mystic', 'cosmic', 'stellar', 'quantum', 'neon', 'cyber'];
    const nouns = ['battle', 'arena', 'zone', 'realm', 'dimension', 'world', 'universe', 'galaxy'];
    const numbers = Math.floor(Math.random() * 9999) + 1000;
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const generatedUrl = `${adjective}-${noun}-${numbers}`;
    
    setGameUrl(generatedUrl);
    setIsGenerating(false);
    
    if (onGameCreated) {
      onGameCreated(generatedUrl);
    }
  };

  const copyToClipboard = async () => {
    if (!gameUrl) return;
    
    try {
      const fullUrl = `${window.location.origin}/play/${gameUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openGame = () => {
    if (gameUrl) {
      window.open(`/play/${gameUrl}`, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <FaGamepad className="w-6 h-6" />
          Создать игру
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameUrl ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Создайте уникальную игру с предварительно сгенерированным URL
            </p>
            <Button
              onClick={generateGameUrl}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Генерация...
                </>
              ) : (
                'Создать игру'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">URL игры:</p>
              <div className="bg-gray-100 rounded p-3 font-mono text-sm break-all">
                {gameUrl}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={openGame}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                Открыть игру
              </Button>
              
              <Button
                onClick={() => setShowQRGenerator(true)}
                variant="outline"
                className="w-full"
              >
                <FaQrcode className="w-4 h-4 mr-2" />
                Показать QR-код
              </Button>
              
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <FaCheck className="w-4 h-4 mr-2" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <FaCopy className="w-4 h-4 mr-2" />
                    Скопировать ссылку
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setGameUrl('')}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                Создать новую игру
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Игра запустится автоматически при подключении первого игрока</p>
        </div>
      </CardContent>

      {/* QR Generator Modal */}
      {showQRGenerator && gameUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <GameQRGenerator
            gameUrl={gameUrl}
            onClose={() => setShowQRGenerator(false)}
          />
        </div>
      )}
    </Card>
  );
};

export default GameUrlGenerator;
