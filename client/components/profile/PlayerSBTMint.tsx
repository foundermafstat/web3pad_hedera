'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BadgeCheck, Wallet, Trophy, Target, Star, Calendar } from 'lucide-react';
import { hederaClient } from '@/lib/hedera-client';
import { useWallet } from '@/contexts/WalletContext';

interface PlayerStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalPoints: number;
  totalLosses: number;
  averageScore: number;
  lastGameTimestamp: number;
}

export function PlayerSBTMint() {
  const { data: session, status } = useSession();
  const wallet = useWallet();

  const [address, setAddress] = useState('');
  const [tokenUri, setTokenUri] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSBT, setHasSBT] = useState<boolean | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const current = wallet.walletAddress;
    if (current && !address) setAddress(current);
  }, [wallet.walletAddress]);

  // Check if player has SBT when address is available
  useEffect(() => {
    const checkSBT = async () => {
      if (!address) return;
      
      setIsLoading(true);
      try {
        const hasSBTToken = await hederaClient.hasPlayerSBT(address);
        setHasSBT(hasSBTToken);
        
        if (hasSBTToken) {
          // Load player stats
          const stats = await hederaClient.getPlayerSBTStats(address);
          setPlayerStats(stats);
        }
      } catch (err: any) {
        console.error('Error checking SBT:', err);
        setHasSBT(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSBT();
  }, [address]);

  const handleConnect = async () => {
    try {
      await signIn('hedera', { redirect: false, callbackUrl: '/profile/sbt' });
    } catch (e) {
      // noop
    }
  };

  const handleMint = async () => {
    setError(null);
    setSuccess(null);

    if (!address) {
      setError('Wallet address is required');
      return;
    }

    if (!wallet.isConnected || !wallet.walletAddress) {
      setError('Please connect your Hedera wallet first');
      return;
    }

    setIsMinting(true);
    try {
      // Step 1: Create transaction for user to sign
      console.log('Creating SBT mint transaction...');
      const txData = await hederaClient.createSBTMintTransaction(
        address,
        tokenUri || undefined
      );

      console.log('Transaction created, requesting signature from wallet...');
      console.log('Transaction body data length:', txData.transactionBodyData?.length);

      // Step 2: Sign transaction with user's wallet
      let signedTransaction;
      try {
        // Convert transactionBodyData array to Uint8Array
        const transactionBodyBytes = new Uint8Array(txData.transactionBodyData);
        
        // Use WalletContext's signTransaction method
        const signResult = await wallet.signTransaction(transactionBodyBytes, address);
        
        console.log('Sign result:', signResult);
        
        // Handle different wallet response formats
        if (signResult?.signedTransaction) {
          // WalletConnect format with full signed transaction
          signedTransaction = {
            signedTransactionBytes: signResult.signedTransaction,
            signature: signResult.signature,
            signatureMap: signResult.signatureMap,
            walletType: wallet.walletType || 'walletconnect',
            accountId: address,
            isRealTransaction: true,
          };
        } else if (signResult?.signature) {
          // HashPack or other wallet format
          signedTransaction = {
            signature: signResult.signature,
            walletType: wallet.walletType || 'hashpack',
            accountId: address,
            isRealTransaction: true,
          };
        } else {
          throw new Error('Invalid signature response from wallet');
        }
      } catch (signError: any) {
        console.error('Signing error:', signError);
        throw new Error(`Failed to sign transaction: ${signError?.message || 'Unknown error'}`);
      }

      console.log('Transaction signed, executing...');

      // Step 3: Execute signed transaction
      const result = await hederaClient.executeSBTMint(
        signedTransaction,
        address,
        txData.transactionData
      );

      console.log('SBT minted successfully:', result);
      setSuccess(`SBT minted successfully! Transaction: ${result.transactionId}`);
      
      // Refresh SBT status after successful mint
      setTimeout(async () => {
        try {
          const hasSBTToken = await hederaClient.hasPlayerSBT(address);
          setHasSBT(hasSBTToken);
          if (hasSBTToken) {
            const stats = await hederaClient.getPlayerSBTStats(address);
            setPlayerStats(stats);
          }
        } catch (err) {
          console.error('Error refreshing SBT status:', err);
        }
      }, 3000);
    } catch (e: any) {
      console.error('Mint error:', e);
      setError(e?.message || 'Failed to mint SBT');
    } finally {
      setIsMinting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const disabled = status === 'loading' || isMinting || isLoading;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2">
          <BadgeCheck className="h-6 w-6" />
          Mint Player SBT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === 'loading' || isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">Loading...</p>
          </div>
        ) : !session?.user ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">Sign in with a Hedera wallet to mint your SBT</p>
            <Button onClick={handleConnect} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Connect Wallet
            </Button>
          </div>
        ) : hasSBT && playerStats ? (
          <div className="space-y-6">
            <Alert className="bg-green-500/20 border-green-500/30">
              <BadgeCheck className="h-5 w-5 text-green-400" />
              <AlertDescription className="text-green-400 ml-2">
                You already have a Player SBT token!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Total Games</span>
                </div>
                <p className="text-2xl font-bold text-white">{playerStats.totalGamesPlayed}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Total Wins</span>
                </div>
                <p className="text-2xl font-bold text-white">{playerStats.totalWins}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Total Points</span>
                </div>
                <p className="text-2xl font-bold text-white">{playerStats.totalPoints.toLocaleString()}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Average Score</span>
                </div>
                <p className="text-2xl font-bold text-white">{playerStats.averageScore.toFixed(0)}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-red-400" />
                  <span className="text-gray-400 text-sm">Losses</span>
                </div>
                <p className="text-2xl font-bold text-white">{playerStats.totalLosses}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-400 text-sm">Last Played</span>
                </div>
                <p className="text-lg font-bold text-white">{formatDate(playerStats.lastGameTimestamp)}</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>Win Rate:</strong> {playerStats.totalGamesPlayed > 0 
                  ? ((playerStats.totalWins / playerStats.totalGamesPlayed) * 100).toFixed(1) 
                  : 0}%
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="wallet-address" className="text-white">Wallet address (Hedera 0.0.x or 0x...)</Label>
              <Input
                id="wallet-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0.0.xxxxx or 0x..."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="token-uri" className="text-white">Token URI (optional)</Label>
              <Input
                id="token-uri"
                type="text"
                value={tokenUri}
                onChange={(e) => setTokenUri(e.target.value)}
                placeholder="ipfs://..."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                disabled={disabled}
              />
            </div>

            <Button onClick={handleMint} disabled={disabled || !address} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              {isMinting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint SBT'
              )}
            </Button>

            {error && (
              <Alert className="bg-red-500/20 border-red-500/30">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/20 border-green-500/30">
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


