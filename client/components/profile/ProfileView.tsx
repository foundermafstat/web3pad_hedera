'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ProfileHeader } from './ProfileHeader';
import { StatsTab } from './StatsTab';
import { AchievementsTab } from './AchievementsTab';
import { MatchHistoryTab } from './MatchHistoryTab';
import { SettingsTab } from './SettingsTab';
import { SBTTab } from './SBTTab';
import { NFTTab } from './NFTTab';

interface ProfileViewProps {
	profileData: any;
	isOwnProfile: boolean;
	currentUser: any;
}

export function ProfileView({ profileData, isOwnProfile, currentUser }: ProfileViewProps) {
	const [activeTab, setActiveTab] = useState('stats');

	// Get primary wallet address or first wallet address
	const primaryWallet = profileData.user.wallets?.find((w: any) => w.isPrimary) || profileData.user.wallets?.[0];
	let walletAddress = primaryWallet?.address;
	
	// Convert hedera_0_0_XXXXX format to 0.0.XXXXX for blockchain queries
	if (walletAddress && walletAddress.startsWith('hedera_')) {
		const originalAddress = walletAddress;
		walletAddress = walletAddress.replace('hedera_', '').replace(/_/g, '.');
		console.log('[ProfileView] Converted wallet address:', originalAddress, '→', walletAddress);
	}
	
	const hasWallet = !!walletAddress;

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<ProfileHeader user={profileData.user} stats={profileData.stats.overall} />

			<div className="mt-8">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-8">
						<TabsTrigger value="stats">Statistics</TabsTrigger>
						<TabsTrigger value="achievements">Achievements</TabsTrigger>
						<TabsTrigger value="history">Match History</TabsTrigger>
						{hasWallet && <TabsTrigger value="sbt">SBT Token</TabsTrigger>}
						{hasWallet && <TabsTrigger value="nft">NFT Tokens</TabsTrigger>}
						{isOwnProfile && <TabsTrigger value="settings">Settings</TabsTrigger>}
					</TabsList>

					<TabsContent value="stats">
						<StatsTab stats={profileData.stats} />
					</TabsContent>

					<TabsContent value="achievements">
						<AchievementsTab achievements={profileData.achievements} />
					</TabsContent>

					<TabsContent value="history">
						<MatchHistoryTab games={profileData.recentGames} />
					</TabsContent>

					{hasWallet && (
						<>
							<TabsContent value="sbt">
								<SBTTab userAddress={walletAddress} />
							</TabsContent>

							<TabsContent value="nft">
								<NFTTab userAddress={walletAddress} />
							</TabsContent>
						</>
					)}

					{isOwnProfile && (
						<TabsContent value="settings">
							<SettingsTab user={profileData.user} />
						</TabsContent>
					)}
				</Tabs>
			</div>
		</div>
	);
}

