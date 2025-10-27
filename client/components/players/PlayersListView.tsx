'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaTrophy, FaGamepad, FaChartLine, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Player {
	id: string;
	username: string;
	displayName: string;
	avatar: string | null;
	level: number;
	experience: number;
	coins: number;
	createdAt: string;
	stats: {
		totalGames: number;
		totalWins: number;
		totalScore: number;
		winRate: number;
	};
}

type ViewMode = 'grid' | 'list';
type SortBy = 'level' | 'wins' | 'games' | 'recent';

export function PlayersListView() {
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [sortBy, setSortBy] = useState<SortBy>('level');

	useEffect(() => {
		fetchPlayers();
	}, []);

	const fetchPlayers = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/players/list');
			const data = await response.json();
			setPlayers(data.players || []);
		} catch (error) {
			console.error('Failed to fetch players:', error);
			setPlayers([]);
		} finally {
			setLoading(false);
		}
	};

	const filteredPlayers = players.filter((player) => {
		const matchesSearch = search === '' || 
			player.username.toLowerCase().includes(search.toLowerCase()) ||
			player.displayName.toLowerCase().includes(search.toLowerCase());
		return matchesSearch;
	});

	const sortedPlayers = [...filteredPlayers].sort((a, b) => {
		switch (sortBy) {
			case 'level':
				return b.level - a.level;
			case 'wins':
				return b.stats.totalWins - a.stats.totalWins;
			case 'games':
				return b.stats.totalGames - a.stats.totalGames;
			case 'recent':
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			default:
				return 0;
		}
	});

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<div className="text-center mb-8">
				
				<h1 className="text-4xl font-bold mb-2">Players</h1>
				<p className="text-muted-foreground">
					Explore and connect with other players
				</p>
			</div>

			{/* Filters and Search */}
			<div className="bg-card border border-border rounded-md p-4 mb-6">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2 flex items-center gap-2">
							<FaSearch className="w-4 h-4" />
							Search Players
						</label>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by username or display name..."
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>

					{/* Sort By */}
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2">Sort By</label>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortBy)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="level">Highest Level</option>
							<option value="wins">Most Wins</option>
							<option value="games">Most Games</option>
							<option value="recent">Recently Joined</option>
						</select>
					</div>

					{/* View Mode */}
					<div className="flex-shrink-0">
						<label className="block text-sm font-medium mb-2">View</label>
						<div className="flex gap-2">
							<button
								onClick={() => setViewMode('grid')}
								className={`px-4 py-2 rounded-md transition-colors ${
									viewMode === 'grid'
										? 'bg-primary text-primary-foreground'
										: 'bg-muted hover:bg-muted/80'
								}`}
							>
								Grid
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`px-4 py-2 rounded-md transition-colors ${
									viewMode === 'list'
										? 'bg-primary text-primary-foreground'
										: 'bg-muted hover:bg-muted/80'
								}`}
							>
								List
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<StatCard
					icon={<FaUsers className="w-5 h-5 text-primary" />}
					label="Total Players"
					value={players.length}
					color="text-blue-500"
				/>
				<StatCard
					icon={<FaGamepad className="w-5 h-5 text-primary" />}
					label="Total Games"
					value={players.reduce((sum, p) => sum + p.stats.totalGames, 0)}
					color="text-green-500"
				/>
				<StatCard
					icon={<FaTrophy className="w-5 h-5 text-primary" />}
					label="Total Wins"
					value={players.reduce((sum, p) => sum + p.stats.totalWins, 0)}
					color="text-yellow-500"
				/>
				<StatCard
					icon={<FaChartLine className="w-5 h-5 text-primary" />}
					label="Avg Level"
					value={players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.level, 0) / players.length) : 0}
					color="text-purple-500"
				/>
			</div>

			{/* Players List/Grid */}
			{loading ? (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading players...</p>
				</div>
			) : sortedPlayers.length > 0 ? (
				viewMode === 'grid' ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{sortedPlayers.map((player) => (
							<PlayerCard key={player.id} player={player} />
						))}
					</div>
				) : (
					<div className="space-y-3">
						{sortedPlayers.map((player) => (
							<PlayerListItem key={player.id} player={player} />
						))}
					</div>
				)
			) : (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<FaUsers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
					<p className="text-muted-foreground">No players found</p>
					<p className="text-sm text-muted-foreground mt-2">
						Try changing your search query
					</p>
				</div>
			)}
		</div>
	);
}

function PlayerCard({ player }: { player: Player }) {
	return (
		<Link
			href={`/profile/${player.username}`}
			className="block bg-card border border-border rounded-md p-6 hover:shadow-lg hover:border-primary/50 transition-all group"
		>
			{/* Avatar */}
			<div className="flex items-center gap-4 mb-4">
				{player.avatar ? (
					<img
						src={player.avatar}
						alt={player.displayName}
						className="w-16 h-16 rounded-sm object-cover border-2 border-border group-hover:border-primary transition-colors"
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
							target.nextElementSibling?.classList.remove('hidden');
						}}
					/>
				) : null}
				<div className={`w-16 h-16 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-2 border-border group-hover:border-primary transition-colors ${player.avatar ? 'hidden' : ''}`}>
					{player.displayName[0]}
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
						{player.displayName}
					</h3>
					<p className="text-sm text-muted-foreground truncate">@{player.username}</p>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<div className="bg-muted/50 rounded-md p-3 text-center">
					<div className="text-2xl font-bold text-primary">
						{player.level}
					</div>
					<div className="text-xs text-muted-foreground">Level</div>
				</div>
				<div className="bg-muted/50 rounded-md p-3 text-center">
					<div className="text-2xl font-bold">
						{player.stats.totalGames}
					</div>
					<div className="text-xs text-muted-foreground">Games</div>
				</div>
			</div>

			{/* Additional Info */}
			<div className="flex items-center justify-between text-sm">
				<div>
					<span className="text-muted-foreground">Wins:</span>
					<span className="font-semibold ml-1">{player.stats.totalWins}</span>
				</div>
				<Badge variant="outline">
					{player.stats.winRate}% Win Rate
				</Badge>
			</div>
		</Link>
	);
}

function PlayerListItem({ player }: { player: Player }) {
	return (
		<Link
			href={`/profile/${player.username}`}
			className="flex items-center gap-4 bg-card border border-border rounded-md p-4 hover:shadow-lg hover:border-primary/50 transition-all group"
		>
			{/* Avatar */}
			{player.avatar ? (
				<img
					src={player.avatar}
					alt={player.displayName}
					className="w-14 h-14 rounded-sm object-cover border-2 border-border group-hover:border-primary transition-colors"
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.style.display = 'none';
						target.nextElementSibling?.classList.remove('hidden');
					}}
				/>
			) : null}
			<div className={`w-14 h-14 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold border-2 border-border group-hover:border-primary transition-colors ${player.avatar ? 'hidden' : ''}`}>
				{player.displayName[0]}
			</div>

			{/* Player Info */}
			<div className="flex-1 min-w-0">
				<h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
					{player.displayName}
				</h3>
				<p className="text-sm text-muted-foreground truncate">@{player.username}</p>
			</div>

			{/* Stats */}
			<div className="hidden md:flex items-center gap-6 text-sm">
				<div className="text-center">
					<div className="font-bold text-primary text-xl">{player.level}</div>
					<div className="text-xs text-muted-foreground">Level</div>
				</div>
				<div className="text-center">
					<div className="font-bold text-xl">{player.stats.totalGames}</div>
					<div className="text-xs text-muted-foreground">Games</div>
				</div>
				<div className="text-center">
					<div className="font-bold text-xl">{player.stats.totalWins}</div>
					<div className="text-xs text-muted-foreground">Wins</div>
				</div>
				<div className="text-center">
					<Badge variant="outline">{player.stats.winRate}%</Badge>
					<div className="text-xs text-muted-foreground mt-1">Win Rate</div>
				</div>
			</div>

			{/* Link Icon */}
			<FaExternalLinkAlt className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
		</Link>
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

