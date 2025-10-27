'use client';

import React from 'react';
import { FaStar, FaUsers, FaBolt, FaHeart, FaTrophy, FaShieldAlt } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function KeyFeaturesSection() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
			<div className="text-center space-y-4">
				<h2 className="text-4xl font-bold text-white">Why choose us?</h2>
				<p className="text-gray-300 text-lg max-w-2xl mx-auto">
					Technical advantages of the Web3Pad platform
				</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-primary/20 p-3 rounded-md w-fit mb-4">
							<FaStar className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Zero installation
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Works right in the browser. No apps, no app stores, no
						permissions. Just open the link and play.
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-primary/20 p-3 rounded-md w-fit mb-4">
							<FaUsers className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Up to 10 players
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Support for multiple players simultaneously. Each with unique
						color, name, and individual controller. Perfect for parties!
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-primary/20 p-3 rounded-md w-fit mb-4">
							<FaBolt className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Instant response
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Latency less than 20 milliseconds thanks to WebSocket and local
						network. Controls are as responsive as a real gamepad.
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-primary/20 p-3 rounded-md w-fit mb-4">
							<FaHeart className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Free
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Completely free platform. No subscriptions, no in-app purchases,
						no hidden fees. Just fun!
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-primary/20 p-3 rounded-md w-fit mb-4">
							<FaTrophy className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Different genres
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Shooters, racing, strategies—each game with unique mechanics and
						control style. New games are constantly being added!
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-primary/20 p-3 rounded-md w-fit mb-4">
							<FaShieldAlt className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Privacy
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Games work in your local network. No data leaves your network.
						Full control over privacy.
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
