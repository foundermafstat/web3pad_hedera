'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ProfileHeader } from './ProfileHeader';
import { StatsTab } from './StatsTab';
import { AchievementsTab } from './AchievementsTab';
import { MatchHistoryTab } from './MatchHistoryTab';
import { SettingsTab } from './SettingsTab';

interface ProfileViewProps {
	profileData: any;
	isOwnProfile: boolean;
	currentUser: any;
}

export function ProfileView({ profileData, isOwnProfile, currentUser }: ProfileViewProps) {
	const [activeTab, setActiveTab] = useState('stats');

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<ProfileHeader user={profileData.user} stats={profileData.stats.overall} />

			<div className="mt-8">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 mb-8">
						<TabsTrigger value="stats">Statistics</TabsTrigger>
						<TabsTrigger value="achievements">Achievements</TabsTrigger>
						<TabsTrigger value="history">Match History</TabsTrigger>
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

