'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import QRCodeDisplay from './QRCodeDisplay';
import { FaCopy, FaCheck, FaUser, FaCircle } from 'react-icons/fa';
import { Button } from './ui/button';

interface Player {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  ready?: boolean;
  score?: number;
  alive?: boolean;
}

interface GameQRSheetProps {
  isOpen: boolean;
  onClose: () => void;
  controllerUrl: string;
  players?: Player[];
  gameType?: string;
}

export function GameQRSheet({
  isOpen,
  onClose,
  controllerUrl,
  players = [],
  gameType = 'game',
}: GameQRSheetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(controllerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getPlayerStatus = (player: Player) => {
    if (player.ready !== undefined) {
      return player.ready ? 'Ready' : 'Not Ready';
    }
    if (player.alive !== undefined) {
      return player.alive ? 'Playing' : 'Eliminated';
    }
    return 'Connected';
  };

  const getPlayerStatusColor = (player: Player) => {
    if (player.ready !== undefined) {
      return player.ready ? 'text-green-400' : 'text-yellow-400';
    }
    if (player.alive !== undefined) {
      return player.alive ? 'text-green-400' : 'text-red-400';
    }
    return 'text-blue-400';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">Join Game</SheetTitle>
          <SheetDescription>
            Scan QR code or copy link to join from mobile device
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* QR Code */}
          <div className="flex justify-center px-4">
            <QRCodeDisplay url={controllerUrl} />
          </div>

          {/* Link with copy button */}
          <div className="space-y-2 px-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Room Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={controllerUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <FaCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FaCopy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-500 animate-fade-in">
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Connected Players */}
          <div className="space-y-3 px-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Connected Players
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {players.length} {players.length === 1 ? 'player' : 'players'}
              </span>
            </div>

            {players.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaUser className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No players connected yet</p>
                <p className="text-xs mt-1">Waiting for players to join...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      {/* Player Avatar/Color Indicator */}
                      {player.avatar ? (
                        <div className="text-2xl">{player.avatar}</div>
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: player.color || '#3B82F6',
                          }}
                        >
                          <FaCircle className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}

                      {/* Player Name */}
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {player.name}
                        </p>
                        {player.score !== undefined && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Score: {player.score}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Player Status */}
                    <div className={`text-xs font-medium ${getPlayerStatusColor(player)}`}>
                      {getPlayerStatus(player)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

