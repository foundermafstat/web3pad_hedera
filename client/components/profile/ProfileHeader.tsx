import { FaTrophy, FaStar, FaBullseye, FaPercentage, FaLayerGroup, FaWallet } from 'react-icons/fa';

interface ProfileHeaderProps {
	user: {
		username: string;
		displayName: string;
		avatar?: string;
		level: number;
		experience: number;
		coins: number;
		createdAt: string;
		blockchainConnected?: boolean;
		wallets?: Array<{
			address: string;
			type: string;
			network?: string;
			isPrimary: boolean;
		}>;
	};
	stats: {
		totalGamesPlayed: number;
		totalGamesWon: number;
		totalScore: number;
		winRate: number;
	};
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
	// Calculate experience progress to next level (example: 1000 XP per level)
	const xpPerLevel = 1000;
	const currentLevelXP = user.experience % xpPerLevel;
	const xpProgress = (currentLevelXP / xpPerLevel) * 100;

	return (
		<div className="bg-card border border-border rounded-md overflow-hidden shadow-lg">
			{/* Banner Background */}
			<div className="h-32 bg-gradient-to-r from-primary to-secondary" />

			<div className="px-6 pb-6">
				{/* Avatar and Basic Info */}
				<div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
					{/* Avatar */}
					<div className="relative">
						{user.avatar ? (
							<img
								src={user.avatar}
								alt={user.displayName}
								className="w-32 h-32 rounded-md border-4 border-background object-cover"
								crossOrigin="anonymous"
								referrerPolicy="no-referrer"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
									target.nextElementSibling?.classList.remove('hidden');
								}}
							/>
						) : null}
						<div className={`w-32 h-32 rounded-md border-4 border-background bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold ${user.avatar ? 'hidden' : ''}`}>
							{user.displayName[0].toUpperCase()}
						</div>
						<div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold border-2 border-background">
							{user.level}
						</div>
					</div>

					{/* Name and Stats */}
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-foreground">{user.displayName}</h1>
						<p className="text-muted-foreground">@{user.username}</p>
						
						{/* Wallet Connection Badges */}
						<div className="flex items-center gap-2 mt-2">
							{user.blockchainConnected && (
								<div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
									<FaLayerGroup className="w-3 h-3 text-purple-400" />
									<span className="text-purple-400 text-xs font-medium">Blockchain</span>
								</div>
							)}
						</div>

						{/* XP Progress Bar */}
						<div className="mt-3 max-w-md">
							<div className="flex justify-between text-sm text-muted-foreground mb-1">
								<span>Level {user.level}</span>
								<span>
									{currentLevelXP} / {xpPerLevel} XP
								</span>
							</div>
							<div className="h-2 bg-muted rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
									style={{ width: `${xpProgress}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<StatCard
							icon={<FaBullseye className="w-5 h-5" />}
							label="Games Played"
							value={stats.totalGamesPlayed}
							color="blue"
						/>
						<StatCard
							icon={<FaTrophy className="w-5 h-5" />}
							label="Games Won"
							value={stats.totalGamesWon}
							color="yellow"
						/>
						<StatCard
							icon={<FaStar className="w-5 h-5" />}
							label="Total Score"
							value={stats.totalScore.toLocaleString('en-US')}
							color="purple"
						/>
						<StatCard
							icon={<FaPercentage className="w-5 h-5" />}
							label="Win Rate"
							value={`${stats.winRate}%`}
							color="green"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function StatCard({ icon, label, value, color }: any) {
	const colorClasses = {
		blue: 'text-blue-500 bg-blue-500/10',
		yellow: 'text-yellow-500 bg-yellow-500/10',
		purple: 'text-purple-500 bg-purple-500/10',
		green: 'text-green-500 bg-green-500/10',
	};

	return (
		<div className="bg-muted/50 rounded-md p-3 text-center">
			<div className={`inline-flex p-2 rounded-md mb-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
				{icon}
			</div>
			<div className="text-2xl font-bold text-foreground">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	);
}

