'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { FaWallet, FaCheck, FaLayerGroup, FaBitcoin } from 'react-icons/fa';

interface BlockchainWalletAuthProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export function BlockchainWalletAuth({ onSuccess, onError }: BlockchainWalletAuthProps) {
	const [loading, setLoading] = useState(false);
	const [connected, setConnected] = useState(false);

	const handleConnect = async () => {
		setLoading(true);
		try {
			// TODO: Implement blockchain wallet connection
			// For now, this is a placeholder
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setConnected(true);
			if (onSuccess) onSuccess();
		} catch (error) {
			console.error('Error connecting blockchain wallet:', error);
			if (onError) onError('Failed to connect blockchain wallet');
		} finally {
			setLoading(false);
		}
	};

	if (connected) {
		return (
			<div className="p-4 border border-green-500/20 rounded-md bg-green-500/10">
				<div className="flex items-center gap-2 text-green-500">
					<FaCheck className="w-5 h-5" />
					<p className="font-medium">Blockchain wallet connected</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				Supported wallets: Leather, Unisat, Hiro, and others
			</p>
			
			<div className="grid grid-cols-1 gap-2">
				<Button
					type="button"
					variant="outline"
					className="w-full justify-start"
					onClick={handleConnect}
					disabled={loading}
				>
					<FaBitcoin className="w-5 h-5 mr-2" />
					{loading ? 'Connecting...' : 'Connect Bitcoin Wallet'}
				</Button>
				
				<Button
					type="button"
					variant="outline"
					className="w-full justify-start"
					onClick={handleConnect}
					disabled={loading}
				>
					<FaLayerGroup className="w-5 h-5 mr-2" />
					{loading ? 'Connecting...' : 'Connect Layer 2 Wallet'}
				</Button>
			</div>
			
			<p className="text-xs text-muted-foreground mt-2">
				This feature will enable blockchain transactions, NFT minting, and rewards distribution
			</p>
		</div>
	);
}

