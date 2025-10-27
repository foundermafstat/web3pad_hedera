'use client';

import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaChartLine, FaGamepad } from 'react-icons/fa';
import Link from 'next/link';

interface LeaderboardEntry {
	rank: number;
	userId: string;
	username: string;
	displayName: string;
	avatar?: string;
	level: number;
	experience: number;
	totalScore: number;
	totalGames: number;
	totalWins: number;
	winRate: number;
}

interface LeaderboardData {
	period: string;
	gameType: string;
	rankings: LeaderboardEntry[];
	totalPlayers: number;
}

function StatCard({ icon, label, value }: any) {
	return (
		<div className="bg-card border border-border rounded-md p-4 text-center">
			<div className="inline-flex p-2 rounded-md bg-primary/10 text-primary mb-2">{icon}</div>
			<div className="text-2xl font-bold text-foreground">{value}</div>
			<div className="text-xs text-muted-foreground">{label}</div>
		</div>
	);
}

export function LeaderboardView() {
	const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [period, setPeriod] = useState('alltime');
	const [gameType, setGameType] = useState('global');

	useEffect(() => {
		fetchLeaderboard();
	}, [period, gameType]);

	const fetchLeaderboard = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/leaderboard?period=${period}&gameType=${gameType}`);
			const data = await response.json();
			// Ensure rankings is always an array
			if (data && !data.rankings) {
				data.rankings = [];
			}
			setLeaderboard(data);
		} catch (error) {
			console.error('Failed to fetch leaderboard:', error);
			// Set empty data on error
			setLeaderboard({
				period,
				gameType,
				rankings: [],
				totalPlayers: 0,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<div className="text-center mb-8">
				
				<h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
				<p className="text-muted-foreground">
					Compete with players around the world
				</p>
			</div>

			{/* Filters */}
			<div className="bg-card border border-border rounded-md p-4 mb-6">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Period Filter */}
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">Time Period</label>
						<div className="grid grid-cols-4 gap-2">
							{['daily', 'weekly', 'monthly', 'alltime'].map((p) => (
								<button
									key={p}
									onClick={() => setPeriod(p)}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										period === p
											? 'bg-primary text-primary-foreground'
											: 'bg-muted hover:bg-muted/80'
									}`}
								>
									{p.charAt(0).toUpperCase() + p.slice(1)}
								</button>
							))}
						</div>
					</div>

					{/* Game Type Filter */}
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">Game Type</label>
						<select
							value={gameType}
							onChange={(e) => setGameType(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="global">All Games</option>
							<option value="shooter">Shooter</option>
							<option value="race">Race</option>
							<option value="quiz">Quiz</option>
							<option value="towerdefence">Tower Defence</option>
							<option value="gyrotest">Gyro Test</option>
						</select>
					</div>
				</div>
			</div>

			{/* Stats Summary */}
			{leaderboard && leaderboard.rankings && leaderboard.rankings.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<StatCard
						icon={<FaTrophy className="w-5 h-5" />}
						label="Total Players"
						value={leaderboard.totalPlayers}
					/>
					<StatCard
						icon={<FaGamepad className="w-5 h-5" />}
						label="Total Games"
						value={leaderboard.rankings.reduce((sum, r) => sum + r.totalGames, 0)}
					/>
					<StatCard
						icon={<FaChartLine className="w-5 h-5" />}
						label="Avg Win Rate"
						value={`${Math.round(
							leaderboard.rankings.reduce((sum, r) => sum + r.winRate, 0) /
								leaderboard.totalPlayers
						)}%`}
					/>
					<StatCard
						icon={<FaMedal className="w-5 h-5" />}
						label="Top Score"
						value={leaderboard.rankings[0]?.totalScore.toLocaleString('en-US') || 0}
					/>
				</div>
			)}

			{/* Leaderboard Table */}
			{loading ? (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading leaderboard...</p>
				</div>
			) : leaderboard && leaderboard.rankings && leaderboard.rankings.length > 0 ? (
				<div className="space-y-3">
					{/* Top 3 Podium */}
					{leaderboard.rankings.slice(0, 3).length === 3 && (
						<div className="grid grid-cols-3 gap-4 mb-6">
							{/* 2nd Place */}
							<PodiumCard
								player={leaderboard.rankings[1]}
								position={2}
								color="from-gray-400 to-gray-500"
							/>
							{/* 1st Place */}
							<PodiumCard
								player={leaderboard.rankings[0]}
								position={1}
								color="from-yellow-500 to-orange-500"
							/>
							{/* 3rd Place */}
							<PodiumCard
								player={leaderboard.rankings[2]}
								position={3}
								color="from-orange-600 to-orange-700"
							/>
						</div>
					)}

					{/* Rest of the list */}
					<div className="bg-card border border-border rounded-md divide-y divide-border">
						{leaderboard.rankings.slice(3).map((player) => (
							<LeaderboardRow key={player.userId} player={player} />
						))}
					</div>
				</div>
			) : (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<FaTrophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
					<p className="text-muted-foreground">No leaderboard data yet</p>
					<p className="text-sm text-muted-foreground mt-2">
						Be the first to play and claim the top spot!
					</p>
				</div>
			)}
		</div>
	);
}

function PodiumCard({ player, position, color }: { player: LeaderboardEntry; position: 1 | 2 | 3; color: string }) {
	const icons: Record<1 | 2 | 3, React.ReactElement> = {
		1: <FaCrown className="w-8 h-8 text-white" />,
		2: <FaMedal className="w-6 h-6 text-white" />,
		3: <FaMedal className="w-6 h-6 text-white" />,
	};

	return (
		<Link
			href={`/profile/${player.username}`}
			className={`bg-gradient-to-br ${color} rounded-md p-6 text-white text-center hover:opacity-90 transition-opacity ${
				position === 1 ? 'order-2 transform scale-110' : position === 2 ? 'order-1' : 'order-3'
			}`}
		>
			<div className="flex justify-center mb-3">{icons[position]}</div>
			{player.avatar ? (
				<img
					src={player.avatar}
					alt={player.displayName}
					className="w-16 h-16 rounded-sm mx-auto mb-3 border-2 border-white"
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.style.display = 'none';
						target.nextElementSibling?.classList.remove('hidden');
					}}
				/>
			) : null}
			<div className={`w-16 h-16 rounded-sm mx-auto mb-3 border-2 border-white bg-background/20 flex items-center justify-center text-2xl font-bold ${player.avatar ? 'hidden' : ''}`}>
				{player.displayName[0]}
			</div>
			<div className="font-bold text-lg mb-1">{player.displayName}</div>
			<div className="text-sm opacity-90 mb-2">@{player.username}</div>
			<div className="text-2xl font-bold">{player.totalScore.toLocaleString('en-US')}</div>
			<div className="text-xs opacity-75">points</div>
		</Link>
	);
}

function LeaderboardRow({ player }: { player: LeaderboardEntry }) {
	return (
		<Link
			href={`/profile/${player.username}`}
			className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
		>
			{/* Rank */}
			<div className="w-12 text-center">
				<div className="text-2xl font-bold text-muted-foreground">#{player.rank}</div>
			</div>

			{/* Avatar */}
			{player.avatar ? (
				<img
					src={player.avatar}
					alt={player.displayName}
					className="w-12 h-12 rounded-sm object-cover"
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.style.display = 'none';
						target.nextElementSibling?.classList.remove('hidden');
					}}
				/>
			) : null}
			<div className={`w-12 h-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center font-bold ${player.avatar ? 'hidden' : ''}`}>
				{player.displayName[0]}
			</div>

			{/* Player Info */}
			<div className="flex-1 min-w-0">
				<div className="font-bold text-foreground">{player.displayName}</div>
				<div className="text-sm text-muted-foreground">@{player.username}</div>
			</div>

			{/* Stats */}
			<div className="hidden md:flex items-center gap-6 text-sm">
				<div className="text-center">
					<div className="font-bold text-foreground">{player.totalGames}</div>
					<div className="text-xs text-muted-foreground">Games</div>
				</div>
				<div className="text-center">
					<div className="font-bold text-foreground">{player.totalWins}</div>
					<div className="text-xs text-muted-foreground">Wins</div>
				</div>
				<div className="text-center">
					<div className="font-bold text-foreground">{player.winRate}%</div>
					<div className="text-xs text-muted-foreground">Win Rate</div>
				</div>
			</div>

			{/* Score */}
			<div className="text-right">
				<div className="text-2xl font-bold text-foreground">
					{player.totalScore.toLocaleString('en-US')}
				</div>
				<div className="text-xs text-muted-foreground">points</div>
			</div>
		</Link>
	);
}

