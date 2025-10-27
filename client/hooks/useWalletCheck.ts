'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useWalletCheck() {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setIsConnected(true);
      // Extract address from session (this would need to be implemented in your auth)
      setUserAddress('ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7'); // Placeholder
      // For demo purposes - using a test private key (DO NOT USE IN PRODUCTION)
      setPrivateKey('7287ba251d44a4d3fd9276c88ce34c5c52a038955636ccc70d06af6efc4b09ae01'); // Test private key
    } else {
      setIsConnected(false);
      setUserAddress(null);
      setPrivateKey(null);
    }
  }, [session]);

  return {
    isConnected,
    userAddress,
    privateKey,
    isLoading: status === 'loading',
  };
}