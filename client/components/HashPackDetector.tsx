'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { ExternalLink, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface HashPackDetectorProps {
  onWalletDetected?: (walletType: string) => void;
  onWalletNotFound?: () => void;
}

export function HashPackDetector({ onWalletDetected, onWalletNotFound }: HashPackDetectorProps) {
  const [walletStatus, setWalletStatus] = useState<'checking' | 'found' | 'not-found'>('checking');
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);

  useEffect(() => {
    checkForWallets();
  }, []);

  const checkForWallets = () => {
    const wallets: string[] = [];
    
    if (typeof window !== 'undefined') {
      console.log('🔍 Checking for Hedera wallets...');
      console.log('Window object:', window);
      console.log('HashPack available:', !!(window as any).hashpack);
      console.log('Blade available:', !!(window as any).blade);
      console.log('Yamgo available:', !!(window as any).yamgo);
      console.log('Hedera available:', !!(window as any).hedera);
      
      // Check for HashPack
      if ((window as any).hashpack) {
        console.log('✅ HashPack detected');
        wallets.push('HashPack');
        
        // Check if HashPack is connected
        try {
          const isConnected = (window as any).hashpack.isConnected();
          console.log('HashPack connected:', isConnected);
          
          if (isConnected) {
            const account = (window as any).hashpack.getAccount();
            console.log('HashPack account:', account);
          }
        } catch (error) {
          console.error('Error checking HashPack status:', error);
        }
      }
      
      // Check for Blade
      if ((window as any).blade) {
        console.log('✅ Blade detected');
        wallets.push('Blade');
      }
      
      // Check for Yamgo
      if ((window as any).yamgo) {
        console.log('✅ Yamgo detected');
        wallets.push('Yamgo');
      }
      
      // Check for generic Hedera wallet
      if ((window as any).hedera) {
        console.log('✅ Generic Hedera wallet detected');
        wallets.push('Hedera');
      }
    }
    
    console.log('Detected wallets:', wallets);
    setDetectedWallets(wallets);
    
    if (wallets.length > 0) {
      setWalletStatus('found');
      if (onWalletDetected) {
        onWalletDetected(wallets[0]); // Use first detected wallet
      }
    } else {
      setWalletStatus('not-found');
      if (onWalletNotFound) {
        onWalletNotFound();
      }
    }
  };

  const openHashPackInstall = () => {
    window.open('https://hashpack.app/', '_blank');
  };

  const openBladeInstall = () => {
    window.open('https://blade.portal.hedera.com/', '_blank');
  };

  const openYamgoInstall = () => {
    window.open('https://yamgo.com/', '_blank');
  };

  const refreshWalletCheck = () => {
    console.log('🔄 Refreshing wallet check...');
    checkForWallets();
  };

  if (walletStatus === 'checking') {
    return (
      <Alert className="bg-blue-500/20 border-blue-500/30">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-400">
          Проверка наличия Hedera кошельков...
        </AlertDescription>
      </Alert>
    );
  }

  if (walletStatus === 'found') {
    return (
      <Alert className="bg-green-500/20 border-green-500/30">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-400">
          ✅ Обнаружены кошельки: {detectedWallets.join(', ')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-yellow-500/20 border-yellow-500/30">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-400">
          ⚠️ Hedera кошелек не найден. Для выполнения свапа необходимо установить кошелек.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Рекомендуемые кошельки:</h4>
        
        {/* HashPack */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">HP</span>
            </div>
            <div>
              <h5 className="text-sm font-medium text-white">HashPack</h5>
              <p className="text-xs text-gray-400">Самый популярный Hedera кошелек</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={openHashPackInstall}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-3 h-3 mr-1" />
            Установить
          </Button>
        </div>

        {/* Blade */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div>
              <h5 className="text-sm font-medium text-white">Blade</h5>
              <p className="text-xs text-gray-400">Официальный кошелек Hedera</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={openBladeInstall}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Открыть
          </Button>
        </div>

        {/* Yamgo */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">Y</span>
            </div>
            <div>
              <h5 className="text-sm font-medium text-white">Yamgo</h5>
              <p className="text-xs text-gray-400">Веб-кошелек для Hedera</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={openYamgoInstall}
            className="bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Открыть
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p>• После установки кошелька обновите страницу</p>
        <p>• Подключите кошелек к Hedera Testnet</p>
        <p>• Авторизуйтесь через кошелек в системе</p>
      </div>

      <div className="mt-4">
        <Button
          size="sm"
          onClick={refreshWalletCheck}
          className="w-full bg-gray-600 hover:bg-gray-700"
        >
          🔄 Проверить кошельки снова
        </Button>
      </div>
    </div>
  );
}
