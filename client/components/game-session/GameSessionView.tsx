'use client';

import { FaClock, FaTrophy, FaUsers, FaGamepad, FaBullseye, FaAward, FaCalendar } from 'react-icons/fa';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface GameResult {
	id: string;
	playerId: string;
	playerName: string;
	score: number;
	rank: number | null;
	kills: number | null;
	deaths: number | null;
	lapTime: number | null;
	questionsRight: number | null;
	questionsTotal: number | null;
	achievements: string[];
	performance: any;
}

interface GameSession {
	id: string;
	status: string;
	startedAt: string;
	endedAt: string | null;
	duration: number | null;
	gameData: any;
	gameType: {
		id: string;
		code: string;
		name: string;
		description: string;
		icon: string;
	};
	gameRoom: {
		id: string;
		roomId: string;
		name: string;
	} | null;
	results: GameResult[];
}

interface GameSessionViewProps {
	session: GameSession;
}

export function GameSessionView({ session }: GameSessionViewProps) {
	const startDate = new Date(session.startedAt);
	const endDate = session.endedAt ? new Date(session.endedAt) : null;
	const duration = session.duration ? formatDuration(session.duration) : 'In progress';
	
	// Sort results by rank
	const sortedResults = [...session.results].sort((a, b) => {
		if (a.rank === null) return 1;
		if (b.rank === null) return -1;
		return a.rank - b.rank;
	});

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<Link
					href="/"
					className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
				>
					← Back to Home
				</Link>
				
				<div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-md p-6 border border-border">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
									<FaGamepad className="w-6 h-6 text-primary" />
								</div>
								<div>
									<h1 className="text-3xl font-bold">{session.gameType.name}</h1>
									<p className="text-muted-foreground">{session.gameType.description}</p>
								</div>
							</div>
							
							{session.gameRoom && (
								<div className="mt-4">
									<Badge variant="outline" className="text-sm">
										Room: {session.gameRoom.name} ({session.gameRoom.roomId})
									</Badge>
								</div>
							)}
						</div>
						
						<div className="text-right">
							<Badge 
								variant={session.status === 'completed' ? 'default' : 'secondary'}
								className="text-sm"
							>
								{session.status === 'completed' ? 'Completed' : 'In Progress'}
							</Badge>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				<StatCard
					icon={<FaUsers className="w-5 h-5" />}
					label="Players"
					value={session.results.length}
					color="text-blue-500"
				/>
				<StatCard
					icon={<FaClock className="w-5 h-5" />}
					label="Duration"
					value={duration}
					color="text-green-500"
				/>
				<StatCard
					icon={<FaCalendar className="w-5 h-5" />}
					label="Started"
					value={startDate.toLocaleTimeString()}
					color="text-purple-500"
				/>
				<StatCard
					icon={<FaTrophy className="w-5 h-5" />}
					label="High Score"
					value={sortedResults[0]?.score.toLocaleString('en-US') || 0}
					color="text-yellow-500"
				/>
			</div>

			{/* Results */}
			<div className="space-y-6">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<FaTrophy className="w-6 h-6" />
					Results
				</h2>

				{/* Top 3 Podium */}
				{sortedResults.length >= 3 && (
					<div className="grid grid-cols-3 gap-4 mb-6">
						{/* 2nd Place */}
						{sortedResults[1] && (
							<PodiumCard
								result={sortedResults[1]}
								position={2}
								gameType={session.gameType.code}
							/>
						)}
						{/* 1st Place */}
						{sortedResults[0] && (
							<PodiumCard
								result={sortedResults[0]}
								position={1}
								gameType={session.gameType.code}
							/>
						)}
						{/* 3rd Place */}
						{sortedResults[2] && (
							<PodiumCard
								result={sortedResults[2]}
								position={3}
								gameType={session.gameType.code}
							/>
						)}
					</div>
				)}

				{/* All Results */}
				<div className="bg-card border border-border rounded-md overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-muted/50">
								<tr>
									<th className="px-4 py-3 text-left font-semibold">Rank</th>
									<th className="px-4 py-3 text-left font-semibold">Player</th>
									<th className="px-4 py-3 text-right font-semibold">Score</th>
									{session.gameType.code === 'shooter' && (
										<>
											<th className="px-4 py-3 text-right font-semibold">Kills</th>
											<th className="px-4 py-3 text-right font-semibold">Deaths</th>
											<th className="px-4 py-3 text-right font-semibold">K/D</th>
										</>
									)}
									{session.gameType.code === 'race' && (
										<th className="px-4 py-3 text-right font-semibold">Lap Time</th>
									)}
									{session.gameType.code === 'quiz' && (
										<>
											<th className="px-4 py-3 text-right font-semibold">Correct</th>
											<th className="px-4 py-3 text-right font-semibold">Total</th>
											<th className="px-4 py-3 text-right font-semibold">Accuracy</th>
										</>
									)}
									<th className="px-4 py-3 text-right font-semibold">Achievements</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{sortedResults.map((result, index) => (
									<ResultRow
										key={result.id}
										result={result}
										index={index}
										gameType={session.gameType.code}
									/>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Game Data */}
			{session.gameData && (
				<div className="mt-8">
					<h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
						<FaBullseye className="w-6 h-6" />
						Game Details
					</h2>
					<div className="bg-card border border-border rounded-md p-6">
						<pre className="text-xs overflow-auto max-h-96">
							{JSON.stringify(session.gameData, null, 2)}
						</pre>
					</div>
				</div>
			)}
		</div>
	);
}

function StatCard({ icon, label, value, color }: any) {
	return (
		<div className="bg-card border border-border rounded-md p-4">
			<div className={`inline-flex p-2 rounded-md bg-muted mb-2 ${color}`}>
				{icon}
			</div>
			<div className="text-2xl font-bold">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	);
}

function PodiumCard({ result, position, gameType }: { result: GameResult; position: number; gameType: string }) {
	const colors: Record<number, string> = {
		1: 'from-yellow-500 to-orange-500',
		2: 'from-gray-400 to-gray-500',
		3: 'from-orange-600 to-orange-700',
	};

	const heights: Record<number, string> = {
		1: 'h-48',
		2: 'h-40',
		3: 'h-36',
	};

	return (
		<div
			className={`bg-gradient-to-br ${colors[position]} rounded-md p-6 text-white text-center ${heights[position]} flex flex-col justify-end ${
				position === 1 ? 'order-2 transform scale-105' : position === 2 ? 'order-1' : 'order-3'
			}`}
		>
			<div className="mb-2">
				{position === 1 ? (
					<FaTrophy className="w-8 h-8 mx-auto" />
				) : (
					<div className="text-3xl font-bold">#{position}</div>
				)}
			</div>
			<div className="font-bold text-lg mb-1 truncate">{result.playerName}</div>
			<div className="text-2xl font-bold">{result.score.toLocaleString('en-US')}</div>
			<div className="text-xs opacity-75">points</div>
			{gameType === 'shooter' && result.kills !== null && (
				<div className="text-xs opacity-75 mt-1">
					K/D: {result.deaths ? (result.kills / result.deaths).toFixed(2) : result.kills}
				</div>
			)}
			{gameType === 'quiz' && result.questionsTotal !== null && (
				<div className="text-xs opacity-75 mt-1">
					{result.questionsRight}/{result.questionsTotal}
				</div>
			)}
		</div>
	);
}

function ResultRow({ result, index, gameType }: { result: GameResult; index: number; gameType: string }) {
	const isTopThree = index < 3;
	const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];

	return (
		<tr className="hover:bg-muted/50 transition-colors">
			<td className="px-4 py-4">
				<div className={`text-xl font-bold ${isTopThree ? rankColors[index] : 'text-muted-foreground'}`}>
					{result.rank ? `#${result.rank}` : '-'}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
						{result.playerName[0]}
					</div>
					<div className="font-medium">{result.playerName}</div>
				</div>
			</td>
			<td className="px-4 py-4 text-right">
				<div className="text-xl font-bold">{result.score.toLocaleString('en-US')}</div>
			</td>
			{gameType === 'shooter' && (
				<>
					<td className="px-4 py-4 text-right">
						<Badge variant="outline" className="font-mono">
							{result.kills ?? 0}
						</Badge>
					</td>
					<td className="px-4 py-4 text-right">
						<Badge variant="outline" className="font-mono">
							{result.deaths ?? 0}
						</Badge>
					</td>
					<td className="px-4 py-4 text-right">
						<Badge variant="default" className="font-mono">
							{result.deaths ? ((result.kills ?? 0) / result.deaths).toFixed(2) : (result.kills ?? 0)}
						</Badge>
					</td>
				</>
			)}
			{gameType === 'race' && (
				<td className="px-4 py-4 text-right">
					<Badge variant="outline" className="font-mono">
						{result.lapTime ? formatLapTime(result.lapTime) : '-'}
					</Badge>
				</td>
			)}
			{gameType === 'quiz' && (
				<>
					<td className="px-4 py-4 text-right">
						<Badge variant="outline" className="font-mono">
							{result.questionsRight ?? 0}
						</Badge>
					</td>
					<td className="px-4 py-4 text-right">
						<Badge variant="outline" className="font-mono">
							{result.questionsTotal ?? 0}
						</Badge>
					</td>
					<td className="px-4 py-4 text-right">
						<Badge variant="default" className="font-mono">
							{result.questionsTotal
								? `${Math.round(((result.questionsRight ?? 0) / result.questionsTotal) * 100)}%`
								: '0%'}
						</Badge>
					</td>
				</>
			)}
			<td className="px-4 py-4 text-right">
				{result.achievements.length > 0 ? (
					<div className="flex justify-end gap-1">
						{result.achievements.slice(0, 3).map((achievement, i) => (
							<FaAward key={i} className="w-5 h-5 text-yellow-500" />
						))}
						{result.achievements.length > 3 && (
							<span className="text-xs text-muted-foreground">
								+{result.achievements.length - 3}
							</span>
						)}
					</div>
				) : (
					<span className="text-muted-foreground text-sm">-</span>
				)}
			</td>
		</tr>
	);
}

function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatLapTime(milliseconds: number): string {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const ms = milliseconds % 1000;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

