'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaClock, FaUsers, FaGamepad, FaStar } from 'react-icons/fa';

interface GameType {
	id: string;
	code: string;
	name: string;
	shortDescription: string;
	icon: string;
	images: string[];
	category: string[];
	gameType: string;
	minPlayers: number;
	maxPlayers: number;
	difficulty: string;
	estimatedDuration?: number;
	controls: string[];
	isFeatured: boolean;
}

export function GamesGalleryView() {
	const [games, setGames] = useState<GameType[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'web2' | 'web3' | 'featured'>('all');

	useEffect(() => {
		fetch('/api/games')
			.then((res) => res.json())
			.then((data) => {
				setGames(data.games || []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const filteredGames = games.filter((game) => {
		switch (filter) {
			case 'web2':
				return game.gameType === 'web2';
			case 'web3':
				return game.gameType === 'web3';
			case 'featured':
				return game.isFeatured;
			default:
				return true;
		}
	});

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-500/10 text-green-500 border-green-500/20';
			case 'medium':
				return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
			case 'hard':
				return 'bg-red-500/10 text-red-500 border-red-500/20';
			default:
				return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
		}
	};

	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card key={i} className="animate-pulse">
						<div className="h-48 bg-muted rounded-t-lg" />
						<CardHeader>
							<div className="h-4 bg-muted rounded w-3/4" />
							<div className="h-3 bg-muted rounded w-full" />
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="h-3 bg-muted rounded w-1/2" />
								<div className="h-3 bg-muted rounded w-1/3" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div>
			{/* Filter Buttons */}
			<div className="flex flex-wrap gap-3 mb-8">
				<Button
					variant={filter === 'all' ? 'default' : 'outline'}
					onClick={() => setFilter('all')}
					size="sm"
				>
					All Games
				</Button>
				<Button
					variant={filter === 'featured' ? 'default' : 'outline'}
					onClick={() => setFilter('featured')}
					size="sm"
					className="gap-2"
				>
					<FaStar className="w-4 h-4" />
					Featured
				</Button>
				<Button
					variant={filter === 'web2' ? 'default' : 'outline'}
					onClick={() => setFilter('web2')}
					size="sm"
				>
					Web2 Games
				</Button>
				<Button
					variant={filter === 'web3' ? 'default' : 'outline'}
					onClick={() => setFilter('web3')}
					size="sm"
				>
					Web3 Games
				</Button>
			</div>

			{/* Games Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredGames.map((game) => (
					<Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
						{/* Game Image */}
						<div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
							{game.images.length > 0 ? (
								<img
									src={game.images[0]}
									alt={game.name}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							) : (
								<span className="text-6xl">{game.icon}</span>
							)}
							{game.isFeatured && (
								<Badge className="absolute top-2 right-2 bg-yellow-500/90 text-black">
									<FaStar className="w-3 h-3 mr-1" />
									Featured
								</Badge>
							)}
							<Badge
								variant={game.gameType === 'web3' ? 'default' : 'secondary'}
								className="absolute top-2 left-2"
							>
								{game.gameType.toUpperCase()}
							</Badge>
						</div>

						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-xl group-hover:text-primary transition-colors">
										{game.name}
									</CardTitle>
									<CardDescription className="mt-1">
										{game.shortDescription}
									</CardDescription>
								</div>
							</div>

							{/* Category Tags */}
							<div className="flex flex-wrap gap-1 mt-2">
								{game.category.slice(0, 3).map((cat) => (
									<Badge key={cat} variant="outline" className="text-xs">
										{cat}
									</Badge>
								))}
							</div>
						</CardHeader>

						<CardContent>
							{/* Game Stats */}
							<div className="space-y-3">
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<FaUsers className="w-4 h-4" />
										<span>{game.minPlayers}-{game.maxPlayers}</span>
									</div>
									{game.estimatedDuration && (
										<div className="flex items-center gap-1">
											<FaClock className="w-4 h-4" />
											<span>{game.estimatedDuration} min</span>
										</div>
									)}
									<div className="flex items-center gap-1">
										<FaGamepad className="w-4 h-4" />
										<span>{game.controls.length}</span>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<Badge className={getDifficultyColor(game.difficulty)}>
										{game.difficulty === 'easy' && 'Easy'}
										{game.difficulty === 'medium' && 'Medium'}
										{game.difficulty === 'hard' && 'Hard'}
									</Badge>
								</div>

								<Link href={`/games/${game.code}`} className="block">
									<Button className="w-full" variant="outline">
										Learn More
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredGames.length === 0 && !loading && (
				<div className="text-center py-12">
					<FaGamepad className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">No Games Found</h3>
					<p className="text-muted-foreground">
						Try changing the filters or check back later
					</p>
				</div>
			)}
		</div>
	);
}
