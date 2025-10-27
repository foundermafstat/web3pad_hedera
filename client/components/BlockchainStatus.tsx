'use client';

import React, { useState, useEffect } from 'react';
import { blockchainService, BlockchainSessionData } from '@/lib/blockchain';

interface BlockchainStatusProps {
  roomId: string;
  playerId?: string;
}

const BlockchainStatus: React.FC<BlockchainStatusProps> = ({ roomId, playerId }) => {
  const [sessionData, setSessionData] = useState<BlockchainSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessionData();
    // Refresh every 10 seconds
    const interval = setInterval(loadSessionData, 10000);
    return () => clearInterval(interval);
  }, [roomId]);

  const loadSessionData = async () => {
    try {
      const data = await blockchainService.getSessionData(roomId);
      if (data) {
        setSessionData(data);
        setError('');
      } else {
        setError('Failed to load blockchain data');
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStatus = (playerId: string) => {
    if (!sessionData) return null;
    
    const hasAddress = !!sessionData.playerAddresses[playerId];
    const hasResult = sessionData.blockchainResults.some(r => r.playerId === playerId);
    
    return {
      hasAddress,
      hasResult,
      address: sessionData.playerAddresses[playerId],
      result: sessionData.blockchainResults.find(r => r.playerId === playerId)
    };
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading blockchain status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 rounded-lg p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!sessionData?.blockchainEnabled) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-yellow-800">Blockchain integration disabled</span>
        </div>
      </div>
    );
  }

  if (playerId) {
    const playerStatus = getPlayerStatus(playerId);
    if (!playerStatus) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-blue-900">Blockchain Status</h3>
          <div className={`w-3 h-3 rounded-full ${
            playerStatus.hasAddress ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Address Connected:</span>
            <span className={playerStatus.hasAddress ? 'text-green-600' : 'text-gray-500'}>
              {playerStatus.hasAddress ? 'Yes' : 'No'}
            </span>
          </div>
          
          {playerStatus.hasAddress && (
            <div className="flex justify-between">
              <span className="text-blue-700">Result Sent:</span>
              <span className={playerStatus.hasResult ? 'text-green-600' : 'text-gray-500'}>
                {playerStatus.hasResult ? 'Yes' : 'No'}
              </span>
            </div>
          )}
          
          {playerStatus.hasResult && playerStatus.result && (
            <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
              <p className="text-xs text-green-800">
                <strong>TX ID:</strong> {playerStatus.result.txId.slice(0, 8)}...
              </p>
              <p className="text-xs text-green-800">
                <strong>Session ID:</strong> {playerStatus.result.sessionId}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show overall room blockchain status
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-blue-900">Room Blockchain Status</h3>
        <div className={`w-3 h-3 rounded-full ${
          sessionData.blockchainSessionId ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-blue-700">Blockchain Session:</span>
          <span className={sessionData.blockchainSessionId ? 'text-green-600' : 'text-gray-500'}>
            {sessionData.blockchainSessionId ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-blue-700">Connected Players:</span>
          <span className="text-blue-600">
            {Object.keys(sessionData.playerAddresses).length}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-blue-700">Results Sent:</span>
          <span className="text-blue-600">
            {sessionData.blockchainResults.length}
          </span>
        </div>
        
        {sessionData.blockchainResults.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-blue-700">Recent Transactions:</p>
            {sessionData.blockchainResults.slice(-3).map((result, index) => (
              <div key={index} className="text-xs bg-green-100 p-1 rounded border border-green-300">
                <p className="text-green-800">
                  Player {result.playerId}: {result.txId.slice(0, 12)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainStatus;
