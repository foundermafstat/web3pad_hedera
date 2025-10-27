'use client';

import React from 'react';
import { FaStar, FaPlay, FaUsers, FaBolt } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameInfo } from './types';
import { getGameIcon, getGameGradient } from './utils';

interface GamesSectionProps {
	games: Record<string, GameInfo>;
	startGame: (gameType: string) => void;
}

export default function GamesSection({ games, startGame }: GamesSectionProps) {
	const gamesArray = Object.entries(games);

	return (
		<div id="games-section" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
			<div className="max-w-7xl mx-auto px-4">
				<div className="text-center mb-16">
					<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-6 py-3 text-base mb-6">
						<FaStar className="w-5 h-5 mr-2" />
						Choose Your Game
					</Badge>
					<h2 className="text-5xl font-bold text-white mb-4">Available Games</h2>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						Each game features unique controls optimized for mobile devices
					</p>
				</div>

				{/* Games Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{gamesArray.map(([gameType, gameInfo], index) => {
						const IconComponent = getGameIcon(gameType);
						return (
							<Card key={gameType} className="bg-gray-800/80 border-gray-700 backdrop-blur-xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-gray-600 h-full">
								<CardHeader>
									<div className="flex items-center justify-between mb-4">
										<div
											className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${getGameGradient(
												index
											)} rounded-2xl shadow-lg transform hover:rotate-6 transition-transform`}
										>
											<IconComponent className="w-12 h-12 text-white" />
										</div>
										<Badge
											variant="secondary"
											className="bg-green-500/20 text-green-400 border-green-500/30"
										>
											<FaBolt className="w-3 h-3 mr-1" />
											Quick Start
										</Badge>
									</div>
									<CardTitle className="text-2xl text-white mb-2 font-bold">
										{gameInfo.name}
									</CardTitle>
									<CardDescription className="text-gray-300 text-sm leading-relaxed">
										{gameInfo.description}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center space-x-4 text-sm">
										<div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-md">
											<FaUsers className="w-4 h-4 text-blue-400" />
											<span className="text-white font-medium">
												{gameInfo.minPlayers}-{gameInfo.maxPlayers} players
											</span>
										</div>
										<div className="text-3xl">{gameInfo.icon}</div>
									</div>
								</CardContent>
								<CardFooter>
									<Button
										onClick={() => startGame(gameType)}
										className={`w-full bg-gradient-to-r ${getGameGradient(
											index
										)} hover:opacity-90 text-white font-bold py-4 text-base shadow-xl hover:shadow-2xl transition-all duration-200`}
									>
										<FaPlay className="w-5 h-5 mr-2" />
										Start Game
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}
