'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { FaWallet, FaTimes, FaCheck, FaCopy } from 'react-icons/fa';
import { HederaWalletConnectButton } from './HederaWalletConnectButton';

interface WalletConnectionProps {
	currentWalletAddress?: string | null;
	onWalletConnect?: (address: string) => Promise<void>;
	onWalletDisconnect?: () => Promise<void>;
}

export function WalletConnection({
	currentWalletAddress,
	onWalletConnect,
	onWalletDisconnect,
}: WalletConnectionProps) {
	const [error, setError] = useState<string>('');
	const [copied, setCopied] = useState(false);

	const handleConnect = async (address: string) => {
		if (onWalletConnect) {
			try {
				await onWalletConnect(address);
				setError('');
			} catch (err) {
				setError('Failed to connect wallet');
				console.error('Error connecting wallet:', err);
			}
		}
	};

	const handleDisconnect = async () => {
		if (onWalletDisconnect) {
			try {
				await onWalletDisconnect();
				setError('');
			} catch (err) {
				setError('Failed to disconnect wallet');
				console.error('Error disconnecting wallet:', err);
			}
		}
	};

	const handleCopy = () => {
		if (currentWalletAddress) {
			navigator.clipboard.writeText(currentWalletAddress);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const shortenAddress = (address: string) => {
		if (!address) return '';
		const parts = address.split(':');
		if (parts.length > 2) {
			// Format: hedera:testnet:0.0.12345 -> 0.0.12345
			return parts[parts.length - 1];
		}
		return address.length > 12 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address;
	};

	return (
		<div className="bg-card border border-border rounded-md p-6">
			<h3 className="text-lg font-bold mb-4 flex items-center gap-2">
				<FaWallet className="w-5 h-5" />
				Hedera Wallet
			</h3>

			<div className="space-y-4">
				{currentWalletAddress ? (
					<>
						<div className="flex items-center justify-between p-4 bg-muted rounded-md">
							<div className="flex items-center gap-2">
								<FaCheck className="w-4 h-4 text-green-500" />
								<div>
									<p className="text-sm font-medium">Connected</p>
									<p className="text-xs text-muted-foreground font-mono">
										{shortenAddress(currentWalletAddress)}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCopy}
									title="Copy address"
								>
									<FaCopy className="w-4 h-4" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={handleDisconnect}
									title="Disconnect wallet"
								>
									<FaTimes className="w-4 h-4 mr-2" />
									Disconnect
								</Button>
							</div>
						</div>
						{copied && (
							<p className="text-xs text-green-500">Address copied to clipboard!</p>
						)}
					</>
				) : (
					<div className="space-y-4">
						<p className="text-muted-foreground text-sm">
							Connect your Hedera wallet to use blockchain features and receive
							rewards for your game achievements.
						</p>
						<HederaWalletConnectButton
							onSuccess={() => {
								// Refetch user data
								window.location.reload();
							}}
							onError={(errorMessage) => {
								setError(errorMessage);
							}}
						/>
						{error && (
							<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
								<p className="text-sm text-destructive">{error}</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

