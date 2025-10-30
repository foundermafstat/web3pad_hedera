'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowUpDown, Wallet, Coins, TrendingUp } from 'lucide-react';
import { hederaService, HederaWalletData } from '@/lib/hedera';
import { blockchainService } from '@/lib/blockchain';
import { hederaClient } from '@/lib/hedera-client';
import { hashpackUtils } from '@/lib/hashpack-utils';
import { authenticatedWalletUtils } from '@/lib/authenticated-wallet-utils';
import { useWallet } from '@/contexts/WalletContext';

interface SwapRate {
  hbarToHplayRate: number;
  bonusMultiplierMin: number;
  bonusMultiplierMax: number;
  dailyLimitHbar: number;
  faucetEnabled: boolean;
}

interface UserSwapInfo {
  dailyUsedHbar: number;
  lastSwapTimestamp: number;
  totalSwaps: number;
}

export function SwapInterface() {
  const { data: session, status } = useSession();
  const wallet = useWallet();
  const [hbarAmount, setHbarAmount] = useState('');
  const [hplayAmount, setHplayAmount] = useState('');
  const [swapRate, setSwapRate] = useState<SwapRate | null>(null);
  const [userSwapInfo, setUserSwapInfo] = useState<UserSwapInfo | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hbarBalance, setHbarBalance] = useState<number>(0);
  const [hplayBalance, setHplayBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get wallet data from authenticated session as fallback
  const walletData = authenticatedWalletUtils.getWalletFromSession(session);

  // Load swap rate and user info on component mount
  useEffect(() => {
    loadSwapData();
  }, []);

  // Update HPLAY amount when HBAR amount changes
  useEffect(() => {
    if (hbarAmount && swapRate) {
      const amount = parseFloat(hbarAmount);
      if (!isNaN(amount)) {
        const hplayAmount = amount * swapRate.hbarToHplayRate;
        setHplayAmount(hplayAmount.toFixed(8));
      }
    } else {
      setHplayAmount('');
    }
  }, [hbarAmount, swapRate]);

  // Load user swap info when wallet is connected
  useEffect(() => {
    const walletAddress = wallet.walletAddress || walletData.wallet?.address;
    if (session?.user && walletAddress) {
      loadUserSwapInfo(walletAddress);
      loadHbarBalance(walletAddress);
      loadHplayBalance(walletAddress);
    }
  }, [session, wallet.walletAddress, wallet.isConnected, walletData]);

  const loadSwapData = async () => {
    try {
      const swapRateData = await hederaClient.getSwapRate();
      setSwapRate(swapRateData);
    } catch (error) {
      setError('Не удалось загрузить курс обмена. Проверьте подключение к сети Hedera.');
    }
  };

  const loadUserSwapInfo = async (address: string) => {
    try {
      const userSwapData = await hederaClient.getUserSwapInfo(address);
      setUserSwapInfo(userSwapData);
    } catch (error) {
      // Silent fail for user swap info
    }
  };

  const loadHbarBalance = async (address: string) => {
    try {
      const balance = await hederaClient.getHbarBalance(address);
      // Convert from tinybars to HBAR (1 HBAR = 100,000,000 tinybars)
      setHbarBalance(balance / 100000000);
    } catch (error) {
      setHbarBalance(0);
    }
  };

  const loadHplayBalance = async (address: string) => {
    try {
      const balance = await hederaClient.getTokenBalance(address);
      setHplayBalance(balance);
    } catch (error) {
      setHplayBalance(0);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Use NextAuth signIn with Hedera provider
      const result = await signIn('hedera', { 
        redirect: false,
        callbackUrl: '/swap'
      });
      
      if (result?.ok) {
        setSuccess('Кошелек успешно подключен');
      } else {
        setError(result?.error || 'Не удалось подключить кошелек');
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка подключения кошелька');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwap = async () => {
    const walletAddress = wallet.walletAddress || walletData.wallet?.address;
    
    if (!walletAddress || !hbarAmount || !swapRate) {
      setError('Заполните все поля');
      return;
    }

    if (!wallet.isConnected && !walletData.isAuthenticated) {
      setError('Кошелек не подключен. Пожалуйста, авторизуйтесь через кошелек.');
      return;
    }

    const amount = parseFloat(hbarAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    if (amount > hbarBalance) {
      setError('Недостаточно HBAR на балансе');
      return;
    }

    if (userSwapInfo && amount > (swapRate.dailyLimitHbar - userSwapInfo.dailyUsedHbar)) {
      setError('Превышен дневной лимит обмена');
      return;
    }

    if (!swapRate.faucetEnabled) {
      setError('Фонтан временно отключен');
      return;
    }

    setIsSwapping(true);
    setError(null);
    setSuccess(null);

    try {
      // Execute real swap transaction through FaucetManager contract
      const swapResult = await executeRealSwap(walletAddress, amount);
      
      const walletTypeUsed = (swapResult as any).walletType || wallet.walletType || 'кошелек';
      setSuccess(`✅ Успешно обменено ${hbarAmount} HBAR на ${swapResult.hplayAmount} HPLAY! Транзакция: ${swapResult.transactionId} (реальная транзакция через ${walletTypeUsed})`);
      setHbarAmount('');
      setHplayAmount('');
      
      // Reload user info and balances
      if (walletAddress) {
        loadUserSwapInfo(walletAddress);
        loadHbarBalance(walletAddress);
        loadHplayBalance(walletAddress);
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка обмена токенов. Проверьте подключение к сети и баланс.');
    } finally {
      setIsSwapping(false);
    }
  };

  const executeRealSwap = async (userAddress: string, hbarAmount: number) => {
    try {
      // Convert HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
      const hbarAmountTinybars = Math.floor(hbarAmount * 100000000);
      
      // Step 1: Create transaction for user to sign
      const transactionData = await hederaClient.createSwapTransaction(userAddress, hbarAmountTinybars);
      
      console.log('📝 Transaction created:', transactionData);
      console.log('📝 Transaction data structure:', {
        hasTransactionData: !!transactionData.transactionData,
        transactionDataType: typeof transactionData.transactionData,
        isArray: Array.isArray(transactionData.transactionData),
        isUint8Array: transactionData.transactionData instanceof Uint8Array,
        keys: transactionData ? Object.keys(transactionData) : [],
        transactionDataKeys: transactionData.transactionData ? Object.keys(transactionData.transactionData) : []
      });
      
      // Step 2: Request user to sign transaction with Hedera wallet
      const signedTransaction = await signTransactionWithWallet(transactionData);
      
      console.log('✍️ Transaction signed by user');
      
      // Step 3: Execute the signed transaction (include original transaction bytes)
      const originalTransactionBytes = transactionData.transactionData instanceof Uint8Array 
        ? transactionData.transactionData 
        : new Uint8Array(transactionData.transactionData);
      
      const swapResult = await executeSignedTransaction(
        signedTransaction, 
        userAddress, 
        hbarAmountTinybars,
        originalTransactionBytes
      );
      
      console.log('✅ Real swap executed successfully:', swapResult);
      return swapResult;
    } catch (error) {
      throw error;
    }
  };

  const signTransactionWithWallet = async (transactionData: any) => {
    // Declare error variable at the start
    let walletConnectError: Error | null = null;
    
    try {
      console.log('🔐 Starting REAL transaction signing process...');
      console.log('📝 Transaction data:', {
        contractId: transactionData.contractId,
        functionName: transactionData.functionName,
        hbarAmount: transactionData.hbarAmount,
        hasTransactionData: !!transactionData.transactionData
      });

      // Use global wallet state - this is the source of truth
      const walletAddress = wallet.walletAddress || walletData.wallet?.address;
      const network = wallet.network || walletData.wallet?.network || 'testnet';
      const walletType = wallet.walletType;

      console.log('🔍 Using global wallet state:', {
        isConnected: wallet.isConnected,
        walletAddress,
        network,
        walletType,
        hasDAppConnector: !!wallet.dAppConnector,
        hasCurrentSession: !!wallet.currentSession
      });

      if (!wallet.isConnected && !walletAddress) {
        throw new Error('Кошелек не подключен. Пожалуйста, авторизуйтесь через кошелек.');
      }

      console.log('✅ Wallet state confirmed:', {
        address: walletAddress,
        network,
        walletType
      });

      // Convert transaction data to Uint8Array if needed
      let transactionBytes: Uint8Array;
      if (transactionData.transactionData instanceof Uint8Array) {
        transactionBytes = transactionData.transactionData;
      } else if (Array.isArray(transactionData.transactionData)) {
        // JSON serialized Uint8Array comes as array of numbers
        transactionBytes = new Uint8Array(transactionData.transactionData);
      } else if (typeof transactionData.transactionData === 'string') {
        // Convert hex string to Uint8Array
        const hex = transactionData.transactionData.replace('0x', '');
        if (hex.length === 0) {
          throw new Error('Пустая строка транзакции');
        }
        transactionBytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
      } else if (transactionData.transactionData && typeof transactionData.transactionData === 'object') {
        // Check if it's an object with bytes property or similar
        console.log('Transaction data is an object, checking for bytes property...', transactionData.transactionData);
        
        // Try to find bytes in common locations
        const bytes = transactionData.transactionData.bytes || 
                     transactionData.transactionData.data || 
                     transactionData.transactionData.transactionBytes ||
                     transactionData.transactionData.bodyBytes;
        
        if (bytes) {
          if (Array.isArray(bytes)) {
            transactionBytes = new Uint8Array(bytes);
          } else if (bytes instanceof Uint8Array) {
            transactionBytes = bytes;
          } else if (typeof bytes === 'string') {
            const hex = bytes.replace('0x', '');
            transactionBytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
          } else {
            throw new Error('Неверный формат bytes в объекте транзакции');
          }
        } else {
          // Check if transactionData has bytes at top level
          if (transactionData.bytes && Array.isArray(transactionData.bytes)) {
            transactionBytes = new Uint8Array(transactionData.bytes);
          } else {
            console.error('Unknown transaction data format:', {
              type: typeof transactionData.transactionData,
              isArray: Array.isArray(transactionData.transactionData),
              value: transactionData.transactionData,
              keys: transactionData ? Object.keys(transactionData) : [],
              transactionDataKeys: transactionData.transactionData ? Object.keys(transactionData.transactionData) : []
            });
            throw new Error(`Неверный формат данных транзакции: ${typeof transactionData.transactionData}. Объект не содержит bytes/data/transactionBytes. Структура: ${JSON.stringify(Object.keys(transactionData.transactionData || {}))}`);
          }
        }
      } else {
        console.error('Unknown transaction data format:', {
          type: typeof transactionData.transactionData,
          isArray: Array.isArray(transactionData.transactionData),
          value: transactionData.transactionData,
          keys: transactionData ? Object.keys(transactionData) : []
        });
        throw new Error(`Неверный формат данных транзакции: ${typeof transactionData.transactionData}. Ожидается Uint8Array, массив чисел или hex-строка.`);
      }

      console.log('✅ Transaction bytes converted:', {
        length: transactionBytes.length,
        firstBytes: Array.from(transactionBytes.slice(0, 10))
      });

      // Step 1: Use global wallet state first (if WalletConnect)
      console.log('🔍 Using global wallet state for signing...');
      let walletConnectError: Error | null = null;

      if (wallet.isConnected && wallet.walletType === 'walletconnect' && wallet.walletAddress === walletAddress) {
        try {
          console.log('🔗 Attempting to sign with global WalletConnect state...');
          console.log('🔗 Wallet state:', {
            address: wallet.walletAddress,
            network: wallet.network,
            walletType: wallet.walletType,
            hasDAppConnector: !!wallet.dAppConnector,
            hasCurrentSession: !!wallet.currentSession
          });
          
          // Use global wallet's signTransaction method
          const signature = await wallet.signTransaction(transactionBytes, walletAddress);

          console.log('✅ Transaction signed successfully via global WalletConnect state:', signature);

          // Validate signature response
          if (!signature || (!signature.signature && !signature.signatureMap)) {
            throw new Error('Invalid signature response from wallet');
          }

          return {
            signature: signature.signature || signature.signatureMap || '',
            accountId: signature.accountId || walletAddress,
            transactionId: signature.transactionId || '',
            walletType: signature.walletType || 'walletconnect',
            isRealTransaction: true,
            timestamp: Date.now(),
            signedTransactionBytes: signature.signedTransactionBytes // Include signed transaction if available
          };
        } catch (error: any) {
          walletConnectError = error instanceof Error ? error : new Error(String(error));
          console.error('❌ Global WalletConnect signing error:', error);
          
          // For user rejection or timeout - don't try other wallets
          const errorMessage = error?.message || '';
          if (errorMessage?.includes('timeout') || errorMessage?.includes('cancelled') || 
              errorMessage?.includes('denied') || errorMessage?.includes('rejected')) {
            throw error;
          }
          
          // For other errors, try fallback to browser wallets
          console.log('⚠️ Falling back to browser wallet due to WalletConnect error...');
        }
      } else {
        console.log('⚠️ Global wallet state not available for WalletConnect:', {
          isConnected: wallet.isConnected,
          walletType: wallet.walletType,
          addressMatch: wallet.walletAddress === walletAddress
        });
        console.log('⚠️ Will try browser wallets...');
      }

      // Step 2: Try HashPack (browser extension)
      console.log('🔍 Checking HashPack availability...');
      const hashpackAvailable = hashpackUtils.isAvailable();
      console.log('HashPack available:', hashpackAvailable);
      
      if (hashpackAvailable) {
        try {
          console.log('🔗 Attempting to sign with HashPack wallet...');
          
          // Try to connect if not connected
          let isConnected = hashpackUtils.isConnected();
          console.log('HashPack initially connected:', isConnected);
          
          if (!isConnected) {
            console.log('⚠️ HashPack not connected, attempting to connect...');
            try {
              await hashpackUtils.connect();
              isConnected = hashpackUtils.isConnected();
              console.log('HashPack connection result:', isConnected);
            } catch (connectError) {
              console.warn('Failed to connect HashPack:', connectError);
            }
          }
          
          if (!isConnected) {
            console.error('❌ HashPack кошелек не подключен. Пожалуйста, подключите кошелек в HashPack расширении.');
            throw new Error('HashPack кошелек не подключен. Пожалуйста, подключите кошелек в HashPack расширении.');
          }
          
          const currentAccount = hashpackUtils.getCurrentAccount();
          console.log('📱 HashPack current account:', currentAccount);
          
          if (!currentAccount) {
            throw new Error('Не удалось получить текущий аккаунт из HashPack. Пожалуйста, откройте HashPack расширение и выберите аккаунт.');
          }
          
          // Verify account matches authenticated wallet
          if (currentAccount.accountId !== walletAddress) {
            console.error('❌ Account mismatch:', {
              expected: walletAddress,
              found: currentAccount.accountId
            });
            throw new Error(`Несоответствие аккаунтов. Ожидается: ${walletAddress}, Найден в HashPack: ${currentAccount.accountId}. Пожалуйста, выберите правильный аккаунт в HashPack.`);
          }
          
          console.log('📝 Signing transaction with HashPack:', {
            accountId: currentAccount.accountId,
            network: network,
            bytesLength: transactionBytes.length
          });
          
          // Add timeout for signing (30 seconds)
          const signingPromise = hashpackUtils.signTransaction(
            transactionBytes,
            currentAccount.accountId,
            network
          );
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Transaction signing timeout. Please try again.')), 30000);
          });
          
          const signature = await Promise.race([signingPromise, timeoutPromise]) as any;
          
          console.log('✅ HashPack transaction signed successfully:', signature);
          
          // Validate signature response
          if (!signature || !signature.signature) {
            throw new Error('Invalid signature response from HashPack wallet');
          }
          
          return {
            signature: signature.signature,
            accountId: signature.accountId || currentAccount.accountId,
            transactionId: signature.transactionId || '',
            walletType: 'hashpack',
            isRealTransaction: true,
            timestamp: Date.now()
          };
          
        } catch (error: unknown) {
          console.error('❌ HashPack signing error:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          // Re-throw timeout and user rejection errors immediately
          if (errorMessage?.includes('timeout') || errorMessage?.includes('rejected') || errorMessage?.includes('denied') || errorMessage?.includes('cancelled')) {
            throw error;
          }
          // Don't throw immediately, allow fallback to other methods if available
          if (!errorMessage?.includes('не подключен') && !errorMessage?.includes('Несоответствие')) {
            console.log('⚠️ HashPack error, but will try other methods if available:', errorMessage);
          } else {
            throw new Error(`Ошибка подписи через HashPack: ${errorMessage}`);
          }
        }
      } else {
        console.log('⚠️ HashPack not available in browser');
      }
      
      // Fallback to other wallets
      if (typeof window !== 'undefined' && (window as any).blade) {
        const blade = (window as any).blade;
        
        try {
          console.log('🔗 Attempting to sign with Blade wallet...');
          
          const result = await blade.request({
            method: 'hedera_signTransaction',
            params: {
              bytes: transactionBytes,
              accountId: walletAddress,
              network: network
            }
          });
          
          console.log('✅ Blade transaction signed successfully');
          return {
            ...result,
            walletType: 'blade',
            accountId: walletAddress,
            isRealTransaction: true
          };
        } catch (error: unknown) {
          console.error('❌ Blade signing error:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Ошибка подписи через Blade: ${errorMessage}`);
        }
      }
      
      // If we reach here, none of the wallet methods worked
      // Provide helpful error message with detailed information
      const walletMethods = [];
      if (wallet.isConnected && wallet.walletType === 'walletconnect') walletMethods.push('WalletConnect (подключен)');
      if (hashpackAvailable) walletMethods.push('HashPack (расширение найдено)');
      if (typeof window !== 'undefined' && (window as any).blade) walletMethods.push('Blade (расширение найдено)');
      
      const errorDetails = walletConnectError ? `\n\nWalletConnect error: ${walletConnectError.message}` : '';
      const availableMethods = walletMethods.length > 0 ? `\nНайдены кошельки: ${walletMethods.join(', ')}` : '\nКошельки не найдены в браузере';
      
      throw new Error(`Не удалось подписать транзакцию через доступные кошельки.${errorDetails}${availableMethods}\n\nРекомендации:\n1. Если используете HashPack: откройте расширение HashPack и убедитесь, что выбран правильный аккаунт (${walletAddress})\n2. Если используете WalletConnect: переподключите кошелек через авторизацию\n3. Убедитесь, что используется правильная сеть (${network === 'testnet' ? 'Testnet' : 'Mainnet'})\n4. Проверьте, что кошелек подключен и активен`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Ошибка подписи транзакции: ${errorMessage}`);
    }
  };

  const executeSignedTransaction = async (
    signedTransaction: any, 
    userAddress: string, 
    hbarAmountTinybars: number,
    originalTransactionBytes?: Uint8Array
  ) => {
    try {
      // Submit the signed transaction to the server with original transaction bytes
      const swapResult = await hederaClient.submitSignedTransaction(
        signedTransaction, 
        userAddress, 
        hbarAmountTinybars,
        originalTransactionBytes
      );
      
      return swapResult;
    } catch (error) {
      throw error;
    }
  };

  const formatHbarAmount = (amount: number) => {
    return `${amount.toFixed(2)} HBAR`;
  };

  const formatHplayAmount = (amount: number) => {
    return `${amount.toFixed(8)} HPLAY`;
  };

  const getRemainingDailyLimit = () => {
    if (!swapRate || !userSwapInfo) return 0;
    return Math.max(0, swapRate.dailyLimitHbar - userSwapInfo.dailyUsedHbar);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Swap Card */}
      <div className="lg:col-span-2">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <ArrowUpDown className="h-6 w-6" />
              Обмен токенов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Connection */}
            {status === 'loading' ? (
              <div className="text-center py-8">
                <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Загрузка...
                </h3>
              </div>
            ) : !session?.user ? (
              <div className="text-center py-8">
                <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Подключите кошелек
                </h3>
                <p className="text-gray-300 mb-6">
                  Для обмена токенов необходимо авторизоваться через Hedera кошелек
                </p>
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Подключение...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Подключить кошелек
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Connected Wallet Info */}
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <Wallet className="h-4 w-4" />
                    <span className="font-medium">Авторизован через кошелек</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    Пользователь: {session.user.name || session.user.email}
                  </p>
                  <p className="text-sm text-gray-300">
                    Адрес: {wallet.walletAddress || walletData.wallet?.address || 'Не указан'}
                  </p>
                  <p className="text-sm text-gray-300">
                    Сеть: {(wallet.network || walletData.wallet?.network) === 'testnet' ? 'Testnet' : 'Mainnet'}
                  </p>
                  {wallet.walletType && (
                    <p className="text-sm text-gray-300">
                      Кошелек: {wallet.walletType === 'walletconnect' ? 'WalletConnect' : wallet.walletType === 'hashpack' ? 'HashPack' : wallet.walletType}
                    </p>
                  )}
                </div>

                {/* HBAR Balance */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Coins className="h-4 w-4" />
                      <span className="font-medium">Баланс HBAR</span>
                    </div>
                    <span className="text-white font-bold">
                      {formatHbarAmount(hbarBalance)}
                    </span>
                  </div>
                </div>

                {/* HPLAY Balance */}
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Coins className="h-4 w-4" />
                      <span className="font-medium">Баланс HPLAY</span>
                    </div>
                    <span className="text-white font-bold">
                      {formatHplayAmount(hplayBalance)}
                    </span>
                  </div>
                </div>

                {/* Swap Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hbar-amount" className="text-white">
                      Сумма HBAR для обмена
                    </Label>
                    <Input
                      id="hbar-amount"
                      type="number"
                      value={hbarAmount}
                      onChange={(e) => setHbarAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      disabled={isSwapping}
                    />
                  </div>

                  <div className="flex justify-center">
                    <ArrowUpDown className="h-6 w-6 text-gray-400" />
                  </div>

                  <div>
                    <Label htmlFor="hplay-amount" className="text-white">
                      Получите HPLAY
                    </Label>
                    <Input
                      id="hplay-amount"
                      type="text"
                      value={hplayAmount}
                      readOnly
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  {/* Swap Rate Info */}
                  {swapRate && (
                    <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>Курс: 1 HBAR = {swapRate.hbarToHplayRate.toFixed(8)} HPLAY</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSwap}
                    disabled={!hbarAmount || isSwapping || !swapRate?.faucetEnabled}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isSwapping ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Обмен...
                      </>
                    ) : (
                      'Обменять токены'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <Alert className="bg-red-500/20 border-red-500/30">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/20 border-green-500/30">
                <AlertDescription className="text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Sidebar */}
      <div className="space-y-6">
        {/* Swap Rate Info */}
        {swapRate && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Информация об обмене
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Курс обмена:</span>
                  <span className="text-white font-medium">
                    1 HBAR = {swapRate.hbarToHplayRate.toFixed(8)} HPLAY
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Дневной лимит:</span>
                  <span className="text-white font-medium">
                    {formatHbarAmount(swapRate.dailyLimitHbar)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Статус:</span>
                  <span className={`font-medium ${swapRate.faucetEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {swapRate.faucetEnabled ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Stats */}
        {userSwapInfo && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Ваша статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Использовано сегодня:</span>
                  <span className="text-white font-medium">
                    {formatHbarAmount(userSwapInfo.dailyUsedHbar)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Осталось сегодня:</span>
                  <span className="text-white font-medium">
                    {formatHbarAmount(getRemainingDailyLimit())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Всего обменов:</span>
                  <span className="text-white font-medium">
                    {userSwapInfo.totalSwaps}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Как обменять
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Установите HashPack или другой Hedera кошелек</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Подключите кошелек через авторизацию</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <span>Введите сумму HBAR для обмена</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <span>Нажмите "Обменять токены"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                <span>Подпишите транзакцию в кошельке</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">6</span>
                <span>Получите HPLAY токены на свой кошелек</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span className="font-medium">✓ РЕАЛЬНЫЙ свап через Hedera сеть</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Hedera ID: 0.0.7153889 (FaucetManager)
              </p>
              <p className="text-xs text-gray-300">
                Ethereum ID: 0xe334AfEc78B410C953A9bEa0Ff1E55F74bdeC212
              </p>
              <p className="text-xs text-gray-300">
                Сеть: Hedera Testnet
              </p>
              <p className="text-xs text-gray-300">
                ✅ Поддержка HashPack, Blade, Yamgo
              </p>
              <p className="text-xs text-gray-300">
                ✅ HBAR списываются с ВАШЕГО кошелька
              </p>
              <p className="text-xs text-gray-300">
                ✅ HPLAY токены зачисляются на ВАШ кошелек
              </p>
              <p className="text-xs text-gray-300">
                ✅ Транзакция выполняется от ВАШЕГО аккаунта
              </p>
              <p className="text-xs text-gray-300">
                ✅ Требуется подпись через кошелек
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
