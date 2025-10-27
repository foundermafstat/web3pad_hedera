import { FaCalendar, FaTrophy, FaBullseye, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';

interface Game {
	id: string;
	gameType: string;
	gameTypeCode: string;
	score: number;
	rank: number;
	createdAt: string;
	sessionId: string;
}

interface MatchHistoryTabProps {
	games: Game[];
}

export function MatchHistoryTab({ games }: MatchHistoryTabProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold">Recent Matches</h2>
				<span className="text-sm text-muted-foreground">Last 10 games</span>
			</div>

			{games.length > 0 ? (
				<div className="space-y-3">
					{games.map((game) => (
						<MatchCard key={game.id} game={game} />
					))}
				</div>
			) : (
				<div className="bg-muted/50 rounded-md p-12 text-center">
					<FaBullseye className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
					<p className="text-muted-foreground">No match history yet</p>
					<p className="text-sm text-muted-foreground mt-2">
						Your recent games will appear here
					</p>
				</div>
			)}
		</div>
	);
}

function MatchCard({ game }: { game: Game }) {
	const date = new Date(game.createdAt);
	const isWin = game.rank === 1;

	return (
		<Link 
			href={`/game-session/${game.sessionId}`}
			className="block bg-card border border-border rounded-md p-4 hover:shadow-lg hover:border-primary/50 transition-all group"
		>
			<div className="flex items-center gap-4">
				{/* Rank Badge */}
				<div
					className={`w-16 h-16 rounded-md flex items-center justify-center font-bold text-lg ${
						isWin
							? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
							: 'bg-muted text-muted-foreground'
					}`}
				>
					{isWin ? <FaTrophy className="w-8 h-8" /> : `#${game.rank}`}
				</div>

				{/* Game Info */}
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h4 className="font-bold text-lg group-hover:text-primary transition-colors">
							{game.gameType}
						</h4>
						{isWin && (
							<span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
								Victory
							</span>
						)}
					</div>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<FaCalendar className="w-4 h-4" />
							{date.toLocaleDateString()} at {date.toLocaleTimeString()}
						</div>
					</div>
				</div>

				{/* Score */}
				<div className="text-right flex items-center gap-3">
					<div>
						<div className="text-2xl font-bold text-foreground">
							{game.score.toLocaleString('en-US')}
						</div>
						<div className="text-xs text-muted-foreground">points</div>
					</div>
					<FaExternalLinkAlt className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
				</div>
			</div>
		</Link>
	);
}

