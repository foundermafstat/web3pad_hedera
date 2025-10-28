'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { FaUpload, FaUser, FaEnvelope, FaShieldAlt, FaLayerGroup, FaCheckCircle } from 'react-icons/fa';
import { WalletConnection } from '../WalletConnection';
// Removed broken import for WalletConnection

interface SettingsTabProps {
	user: {
		id: string;
		username: string;
		displayName: string;
		avatar?: string;
		blockchainConnected?: boolean;
		wallets?: Array<{
			id: string;
			address: string;
			type: string;
			network?: string;
			isPrimary: boolean;
		}>;
	};
}

export function SettingsTab({ user }: SettingsTabProps) {
	const [displayName, setDisplayName] = useState(user.displayName);
	const [loading, setLoading] = useState(false);
	const [wallets, setWallets] = useState(user.wallets || []);
	const [blockchainConnected, setBlockchainConnected] = useState(user.blockchainConnected || false);
	
	// Get primary wallet address for display
	const primaryWallet = wallets.find(w => w.isPrimary) || wallets[0];
	const walletAddress = primaryWallet?.address || null;

	const handleSave = async () => {
		setLoading(true);
		// TODO: Implement save functionality
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setLoading(false);
	};

	const handleWalletConnect = async (address: string) => {
		try {
			const response = await fetch('/api/profile/wallet', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					address,
					type: 'hedera',
					network: 'testnet',
					isPrimary: true 
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to connect wallet');
			}

			const data = await response.json();
			if (data.wallet) {
				setWallets([...wallets, data.wallet]);
			}
		} catch (error) {
			console.error('Error connecting wallet:', error);
			throw error; // Re-throw to let the component handle the error
		}
	};

	const handleWalletDisconnect = async () => {
		try {
			if (!primaryWallet) {
				throw new Error('No wallet to disconnect');
			}

			const response = await fetch('/api/profile/wallet', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					walletId: primaryWallet.id || (primaryWallet as any).id || primaryWallet.address 
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to disconnect wallet');
			}

			setWallets(wallets.filter(w => w.address !== primaryWallet?.address));
		} catch (error) {
			console.error('Error disconnecting wallet:', error);
			throw error; // Re-throw to let the component handle the error
		}
	};


	return (
		<div className="max-w-2xl space-y-6">
			<div className="bg-card border border-border rounded-md p-6">
				<h3 className="text-lg font-bold mb-4 flex items-center gap-2">
					<FaUser className="w-5 h-5" />
					Profile Settings
				</h3>

				<div className="space-y-4">
					{/* Avatar Upload */}
					<div>
						<label className="block text-sm font-medium mb-2">Avatar</label>
						<div className="flex items-center gap-4">
							{user.avatar ? (
								<img
									src={user.avatar}
									alt="Avatar"
									className="w-20 h-20 rounded-full object-cover"
								/>
							) : (
								<div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
									{user.displayName[0].toUpperCase()}
								</div>
							)}
							<Button variant="outline" size="sm">
								<FaUpload className="w-4 h-4 mr-2" />
								Upload New Avatar
							</Button>
						</div>
					</div>

					{/* Display Name */}
					<div>
						<label htmlFor="displayName" className="block text-sm font-medium mb-2">
							Display Name
						</label>
						<input
							id="displayName"
							type="text"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						/>
					</div>

					{/* Username (read-only) */}
					<div>
						<label className="block text-sm font-medium mb-2">Username</label>
						<input
							type="text"
							value={user.username}
							disabled
							className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Username cannot be changed
						</p>
					</div>
				</div>
			</div>

			{/* Account Settings */}
			<div className="bg-card border border-border rounded-md p-6">
				<h3 className="text-lg font-bold mb-4 flex items-center gap-2">
					<FaShieldAlt className="w-5 h-5" />
					Account Settings
				</h3>

				<div className="space-y-4">
					<Button variant="outline" className="w-full">
						<FaEnvelope className="w-4 h-4 mr-2" />
						Change Email
					</Button>
					<Button variant="outline" className="w-full">
						<FaShieldAlt className="w-4 h-4 mr-2" />
						Change Password
					</Button>
				</div>
			</div>

			{/* Crypto Wallet Section */}
			<WalletConnection
				currentWalletAddress={walletAddress}
				onWalletConnect={handleWalletConnect}
				onWalletDisconnect={handleWalletDisconnect}
			/>

			{/* Save Button */}
			<Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
				{loading ? 'Saving...' : 'Save Changes'}
			</Button>
		</div>
	);
}

