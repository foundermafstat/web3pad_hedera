'use client';

import { useState, useEffect } from 'react';
import { FaCalendar, FaTrophy, FaUsers, FaGamepad, FaFilter, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface GameSession {
	id: string;
	status: string;
	startedAt: string;
	endedAt: string | null;
	duration: number | null;
	gameType: {
		code: string;
		name: string;
		icon: string;
	};
	results: {
		id: string;
		playerName: string;
		score: number;
	}[];
	_count?: {
		results: number;
	};
}

export function GamesListView() {
	const [games, setGames] = useState<GameSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');
	const [search, setSearch] = useState('');

	useEffect(() => {
		fetchGames();
	}, []);

	const fetchGames = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/games/list');
			const data = await response.json();
			setGames(data.games || []);
		} catch (error) {
			console.error('Failed to fetch games:', error);
			setGames([]);
		} finally {
			setLoading(false);
		}
	};

	const filteredGames = games.filter((game) => {
		const matchesFilter = filter === 'all' || game.gameType.code === filter;
		const matchesSearch = search === '' || 
			game.gameType.name.toLowerCase().includes(search.toLowerCase()) ||
			game.results.some(r => r.playerName.toLowerCase().includes(search.toLowerCase()));
		return matchesFilter && matchesSearch;
	});

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<div className="text-center mb-8">
	
				<h1 className="text-4xl font-bold mb-2">Past Games</h1>
				<p className="text-muted-foreground">
					History of all game sessions
				</p>
			</div>

			{/* Filters */}
			<div className="bg-card border border-border rounded-md p-4 mb-6">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Game Type Filter */}
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2 flex items-center gap-2">
							<FaFilter className="w-4 h-4 text-primary" />
							Game Type
						</label>
						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="all">All Games</option>
							<option value="shooter">Shooter</option>
							<option value="race">Race</option>
							<option value="quiz">Quiz</option>
							<option value="towerdefence">Tower Defence</option>
							<option value="gyrotest">Gyro Test</option>
						</select>
					</div>

					{/* Search */}
					<div className="flex-1">
						<label className="block text-sm font-medium mb-2 flex items-center gap-2">
							<FaSearch className="w-4 h-4 text-primary" />
							Search
						</label>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by game name or player..."
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<StatCard
					icon={<FaGamepad className="w-5 h-5" />}
					label="Total Games"
					value={games.length}
					color="text-primary"
				/>
				<StatCard
					icon={<FaUsers className="w-5 h-5" />}
					label="Players"
					value={games.reduce((sum, g) => sum + (g._count?.results || g.results.length), 0)}
					color="text-primary"
				/>
				<StatCard
					icon={<FaTrophy className="w-5 h-5" />}
					label="Completed"
					value={games.filter(g => g.status === 'completed').length}
					color="text-primary"
				/>
				<StatCard
					icon={<FaCalendar className="w-5 h-5" />}
					label="Today"
					value={games.filter(g => {
						const gameDate = new Date(g.startedAt);
						const today = new Date();
						return gameDate.toDateString() === today.toDateString();
					}).length}
					color="text-primary"
				/>
			</div>

			{/* Games List */}
			{loading ? (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading games...</p>
				</div>
			) : filteredGames.length > 0 ? (
				<div className="space-y-3">
					{filteredGames.map((game) => (
						<GameCard key={game.id} game={game} />
					))}
				</div>
			) : (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<FaGamepad className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
					<p className="text-muted-foreground">No games found</p>
					<p className="text-sm text-muted-foreground mt-2">
						Try changing filters or search
					</p>
				</div>
			)}
		</div>
	);
}

function GameCard({ game }: { game: GameSession }) {
	const date = new Date(game.startedAt);
	const topPlayer = game.results.length > 0 
		? game.results.reduce((prev, current) => (prev.score > current.score ? prev : current))
		: null;

	return (
		<Link
			href={`/game-session/${game.id}`}
			className="block bg-card border border-border rounded-md p-4 hover:shadow-lg hover:border-primary/50 transition-all group"
		>
			<div className="flex items-center gap-4">
				{/* Game Icon */}
				<div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
					<FaGamepad className="w-8 h-8 text-primary" />
				</div>

				{/* Game Info */}
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-bold text-lg group-hover:text-primary transition-colors">
							{game.gameType.name}
						</h3>
						<Badge 
							variant={game.status === 'completed' ? 'default' : 'secondary'}
							className="text-xs"
						>
							{game.status === 'completed' ? 'Completed' : 'In Progress'}
						</Badge>
					</div>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<FaCalendar className="w-4 h-4" />
							{date.toLocaleDateString()} at {date.toLocaleTimeString()}
						</div>
						<div className="flex items-center gap-1">
							<FaUsers className="w-4 h-4" />
							{game._count?.results || game.results.length} players
						</div>
					</div>
				</div>

				{/* Top Score */}
				<div className="text-right flex items-center gap-3">
					<div>
						{topPlayer && (
							<>
								<div className="text-sm text-muted-foreground mb-1">
									Top: {topPlayer.playerName}
								</div>
								<div className="text-xl font-bold text-foreground">
									{topPlayer.score.toLocaleString('en-US')}
								</div>
							</>
						)}
					</div>
					<FaExternalLinkAlt className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
				</div>
			</div>
		</Link>
	);
}

function StatCard({ icon, label, value, color }: any) {
	return (
		<div className="bg-card border border-border rounded-md p-4 flex items-center gap-4">
			<div className={`inline-flex p-2 rounded-md bg-primary/20 mb-2 ${color}`}>
				{icon}
			</div>
			<div className="flex flex-col">
				<div className="text-2xl font-bold">{value}</div>
				<div className="text-xs text-muted-foreground">{label}</div>
			</div>
		</div>
	);
}

