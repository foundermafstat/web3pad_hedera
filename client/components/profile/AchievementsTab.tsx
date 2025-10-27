import { FaAward, FaLock, FaTrophy } from 'react-icons/fa';

interface Achievement {
	id: string;
	code: string;
	name: string;
	description: string;
	icon?: string;
	category: string;
	points: number;
	unlockedAt: string;
}

interface AchievementsTabProps {
	achievements: Achievement[];
}

export function AchievementsTab({ achievements }: AchievementsTabProps) {
	// Group achievements by category
	const categorizedAchievements = achievements.reduce((acc, achievement) => {
		const category = achievement.category || 'other';
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(achievement);
		return acc;
	}, {} as Record<string, Achievement[]>);

	const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

	return (
		<div className="space-y-6">
			{/* Header Stats */}
			<div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-md p-6">
				<div className="flex items-center gap-4">
					<div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
						<FaAward className="w-8 h-8 text-white" />
					</div>
					<div>
						<div className="text-3xl font-bold text-foreground">
							{achievements.length} Achievements
						</div>
						<div className="text-muted-foreground">
							{totalPoints} total points earned
						</div>
					</div>
				</div>
			</div>

			{/* Achievements by Category */}
			{achievements.length > 0 ? (
				<div className="space-y-8">
					{Object.entries(categorizedAchievements).map(([category, items]) => (
						<div key={category}>
							<h3 className="text-xl font-bold mb-4 capitalize">
								{category} ({items.length})
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{items.map((achievement) => (
									<AchievementCard
										key={achievement.id}
										achievement={achievement}
										unlocked={true}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="bg-muted/50 rounded-md p-12 text-center">
					<FaLock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
					<p className="text-muted-foreground">No achievements unlocked yet</p>
					<p className="text-sm text-muted-foreground mt-2">
						Keep playing to earn achievements!
					</p>
				</div>
			)}
		</div>
	);
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
	return (
		<div
			className={`bg-card border rounded-md p-4 transition-all hover:shadow-lg ${
				unlocked ? 'border-yellow-500/30' : 'border-border opacity-50'
			}`}
		>
			<div className="flex items-start gap-3">
				<div
					className={`w-12 h-12 rounded-md flex items-center justify-center text-2xl ${
						unlocked
							? 'bg-gradient-to-br from-yellow-500 to-orange-500'
							: 'bg-muted'
					}`}
				>
					{unlocked ? (
						<div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary">
							<FaTrophy className="w-4 h-4" />
						</div>
					) : (
						<FaLock className="w-6 h-6 text-muted-foreground" />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-bold text-foreground mb-1">{achievement.name}</h4>
					<p className="text-sm text-muted-foreground mb-2">
						{achievement.description}
					</p>
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
							{achievement.points} points
						</span>
						{unlocked && achievement.unlockedAt && (
							<span className="text-xs text-muted-foreground">
								{new Date(achievement.unlockedAt).toLocaleDateString()}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

