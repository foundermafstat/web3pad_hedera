'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { FaWallet, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import hederaService from '../../lib/hedera';
import { useWallet } from '@/contexts/WalletContext';

interface HederaWalletAuthProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
	network?: 'mainnet' | 'testnet';
}

export function HederaWalletAuth({ onSuccess, onError, network = 'testnet' }: HederaWalletAuthProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { connectWallet, refreshWalletState } = useWallet();

	const handleConnect = async () => {
		setLoading(true);
		setError(null);
		
		try {
			console.log('[HederaWalletAuth] Starting wallet connection and authentication...');
			
			// Step 1: Initialize Hedera service
			console.log(`[HederaWalletAuth] Initializing Hedera service for ${network}...`);
			await hederaService.init(network);
			
			// Step 2: Connect to wallet
			console.log('[HederaWalletAuth] Opening wallet connection modal...');
			let walletData: any;
			try {
				walletData = await hederaService.connect();
			} catch (connectError: any) {
				if (connectError?.message?.includes('Proposal expired') || 
						connectError?.message?.includes('proposal expired')) {
					const errorMessage = 'Запрос на подключение истек. Пожалуйста, попробуйте снова.';
					setError(errorMessage);
					if (onError) onError(errorMessage);
					setLoading(false);
					return;
				}
				throw connectError;
			}
			
			if (!walletData || !walletData.address) {
				const errorMessage = 'Не удалось получить данные кошелька';
				setError(errorMessage);
				if (onError) onError(errorMessage);
				setLoading(false);
				return;
			}
			
			console.log('[HederaWalletAuth] Wallet connected:', walletData.address);
			
			// Step 3: Sign authentication message
			console.log('[HederaWalletAuth] Signing authentication message...');
			const authData = await hederaService.signAuthMessage(walletData.address);
			
			if (!authData || !authData.signature || !authData.message) {
				const errorMessage = 'Не удалось подписать сообщение для авторизации';
				setError(errorMessage);
				if (onError) onError(errorMessage);
				setLoading(false);
				return;
			}
			
			console.log('[HederaWalletAuth] Authentication message signed successfully');
			
			// Step 4: Authenticate via NextAuth with wallet credentials
			console.log('[HederaWalletAuth] Authenticating via NextAuth...');
			const result = await signIn('hedera', {
				walletAddress: authData.address,
				signature: authData.signature,
				message: authData.message,
				network: authData.network || network,
				redirect: false,
				callbackUrl: window.location.pathname
			});
			
			if (result?.ok) {
				console.log('[HederaWalletAuth] Authentication successful via wallet connection');
				
				// Save wallet connection state to global context
				try {
					await connectWallet(authData.network || network);
					console.log('[HederaWalletAuth] Wallet state saved to global context');
				} catch (stateError) {
					console.warn('[HederaWalletAuth] Failed to save wallet state, but auth succeeded:', stateError);
				}
				
				// Refresh wallet state to ensure it's synced
				setTimeout(() => {
					refreshWalletState();
				}, 1000);
				
				if (onSuccess) onSuccess();
			} else {
				const errorMessage = result?.error || 'Не удалось авторизоваться через кошелек';
				console.error('[HederaWalletAuth] Authentication failed:', errorMessage);
				setError(errorMessage);
				if (onError) onError(errorMessage);
			}
		} catch (error: any) {
			console.error('[HederaWalletAuth] Error during wallet connection and authentication:', error);
			
			let errorMessage = 'Ошибка подключения кошелька';
			if (error?.message?.includes('User rejected') || 
					error?.message?.includes('user rejected')) {
				errorMessage = 'Подключение отменено пользователем';
			} else if (error?.message) {
				errorMessage = error.message;
			}
			
			setError(errorMessage);
			if (onError) onError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="text-center">
				<FaWallet className="w-12 h-12 text-blue-500 mx-auto mb-3" />
				<h3 className="text-lg font-semibold mb-2">Вход через подключение кошелька</h3>
				<p className="text-sm text-muted-foreground mb-4">
					Подключите свой Hedera кошелек для входа в систему. Подключение и авторизация выполняются автоматически.
				</p>
			</div>

			{error && (
				<Alert className="bg-red-500/20 border-red-500/30">
					<FaExclamationTriangle className="h-4 w-4 text-red-400" />
					<AlertDescription className="text-red-400">
						{error}
					</AlertDescription>
				</Alert>
			)}

			<Button
				type="button"
				onClick={handleConnect}
				disabled={loading}
				className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
			>
				{loading ? (
					<>
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						Подключение и вход...
					</>
				) : (
					<>
						<FaWallet className="w-4 h-4 mr-2" />
						Войти через кошелек
					</>
				)}
			</Button>

			<div className="text-xs text-muted-foreground space-y-1">
				<p>• Поддерживаются кошельки: HashPack, Blade, Yamgo</p>
				<p>• Подключение кошелька и вход в систему одним действием</p>
				<p>• Авторизация через подпись сообщения</p>
				<p>• Безопасное подключение без передачи приватных ключей</p>
			</div>
		</div>
	);
}
