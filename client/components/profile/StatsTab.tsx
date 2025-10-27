import { FaGamepad, FaTrophy, FaBullseye, FaBolt } from 'react-icons/fa';

interface StatsTabProps {
	stats: {
		byGame: Array<{
			gamesPlayed: number;
			gamesWon: number;
			totalScore: number;
			highestScore: number;
			averageScore: number;
			winRate: number;
			totalKills?: number;
			totalDeaths?: number;
			bestLapTime?: number;
			questionsCorrect?: number;
			questionsAnswered?: number;
		}>;
		overall: {
			totalGamesPlayed: number;
			totalGamesWon: number;
			totalScore: number;
			winRate: number;
		};
	};
}

const GAME_NAMES: { [key: string]: string } = {
	shooter: 'Shooter',
	race: 'Race',
	quiz: 'Quiz',
	towerdefence: 'Tower Defence',
	gyrotest: 'Gyro Test',
};

export function StatsTab({ stats }: StatsTabProps) {
	return (
		<div className="space-y-6">
			{/* Overall Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					icon={<FaGamepad className="w-6 h-6" />}
					title="Total Games"
					value={stats.overall.totalGamesPlayed}
					subtitle="Across all games"
					gradient="from-blue-500 to-cyan-500"
				/>
				<StatCard
					icon={<FaTrophy className="w-6 h-6" />}
					title="Total Wins"
					value={stats.overall.totalGamesWon}
					subtitle={`${stats.overall.winRate}% win rate`}
					gradient="from-yellow-500 to-orange-500"
				/>
				<StatCard
					icon={<FaBullseye className="w-6 h-6" />}
					title="Total Score"
					value={stats.overall.totalScore.toLocaleString('en-US')}
					subtitle="All-time points"
					gradient="from-purple-500 to-pink-500"
				/>
				<StatCard
					icon={<FaBolt className="w-6 h-6" />}
					title="Average Score"
					value={
						stats.overall.totalGamesPlayed > 0
							? Math.round(stats.overall.totalScore / stats.overall.totalGamesPlayed)
							: 0
					}
					subtitle="Per game"
					gradient="from-green-500 to-emerald-500"
				/>
			</div>

			{/* Per-Game Statistics */}
			<div>
				<h2 className="text-2xl font-bold mb-4">Game Statistics</h2>
				{stats.byGame.length > 0 ? (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{stats.byGame.map((gameStat, index) => (
							<GameStatCard key={index} stat={gameStat} gameIndex={index} />
						))}
					</div>
				) : (
					<div className="bg-muted/50 rounded-md p-12 text-center">
						<FaGamepad className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
						<p className="text-muted-foreground">No game statistics yet</p>
						<p className="text-sm text-muted-foreground mt-2">
							Play some games to see your stats here
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function StatCard({ icon, title, value, subtitle, gradient }: any) {
	return (
		<div className="bg-card border border-border rounded-md p-6 hover:shadow-lg transition-shadow">
			<div className={`inline-flex p-3 rounded-md bg-gradient-to-br ${gradient} mb-4`}>
				<div className="text-white">{icon}</div>
			</div>
			<div className="text-3xl font-bold text-foreground mb-1">{value}</div>
			<div className="text-sm font-medium text-foreground mb-1">{title}</div>
			<div className="text-xs text-muted-foreground">{subtitle}</div>
		</div>
	);
}

function GameStatCard({ stat, gameIndex }: any) {
	const gameType = Object.keys(GAME_NAMES)[gameIndex] || 'Unknown';
	const gameName = GAME_NAMES[gameType] || 'Unknown Game';

	return (
		<div className="bg-card border border-border rounded-md p-6 hover:shadow-lg transition-shadow">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
					<FaGamepad className="w-6 h-6 text-primary" />
				</div>
				<div>
					<h3 className="text-lg font-bold">{gameName}</h3>
					<p className="text-sm text-muted-foreground">
						{stat.gamesPlayed} games played
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<StatItem label="Wins" value={stat.gamesWon} />
				<StatItem label="Win Rate" value={`${stat.winRate}%`} />
				<StatItem label="High Score" value={stat.highestScore.toLocaleString('en-US')} />
				<StatItem label="Avg Score" value={Math.round(stat.averageScore).toLocaleString('en-US')} />
				{stat.totalKills !== undefined && (
					<StatItem label="Total Kills" value={stat.totalKills} />
				)}
				{stat.totalDeaths !== undefined && (
					<StatItem label="Total Deaths" value={stat.totalDeaths} />
				)}
				{stat.bestLapTime && (
					<StatItem label="Best Lap" value={`${(stat.bestLapTime / 1000).toFixed(2)}s`} />
				)}
				{stat.questionsCorrect !== undefined && (
					<StatItem
						label="Accuracy"
						value={`${Math.round((stat.questionsCorrect / stat.questionsAnswered) * 100)}%`}
					/>
				)}
			</div>
		</div>
	);
}

function StatItem({ label, value }: { label: string; value: any }) {
	return (
		<div>
			<div className="text-xl font-bold text-foreground">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	);
}

