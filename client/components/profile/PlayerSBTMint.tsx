'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BadgeCheck, Wallet } from 'lucide-react';
import { hederaClient } from '@/lib/hedera-client';
import { useWallet } from '@/contexts/WalletContext';

export function PlayerSBTMint() {
  const { data: session, status } = useSession();
  const wallet = useWallet();

  const [address, setAddress] = useState('');
  const [tokenUri, setTokenUri] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const current = wallet.walletAddress;
    if (current && !address) setAddress(current);
  }, [wallet.walletAddress]);

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

    setIsMinting(true);
    try {
      const res = await hederaClient.mintPlayerSBT(address, tokenUri || undefined);
      setSuccess(`SBT minted successfully. Tx: ${res.transactionId}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to mint SBT');
    } finally {
      setIsMinting(false);
    }
  };

  const disabled = status === 'loading' || isMinting;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2">
          <BadgeCheck className="h-6 w-6" />
          Mint Player SBT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === 'loading' ? (
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


