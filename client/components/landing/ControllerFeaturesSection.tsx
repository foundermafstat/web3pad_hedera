'use client';

import React from 'react';
import { FaBullseye, FaCar, FaBuilding, FaCheckCircle, FaShieldAlt, FaBolt, FaDatabase, FaLink } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ControllerFeaturesSection() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
			<div className="text-center space-y-4">
				<h2 className="text-4xl font-bold text-white">
					Controller capabilities
				</h2>
				<p className="text-gray-300 text-lg max-w-2xl mx-auto">
					Each game has a unique control interface optimized for mobile devices with blockchain integration and smart contract functionality
				</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Shooter Controller */}
				<Card className="bg-gray-800/80 border-gray-700 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
							<FaBullseye className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Battle Arena
						</CardTitle>
						<CardDescription className="text-gray-300">
							Shooter controller
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Virtual joystick for movement</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Aiming joystick</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Fire button</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Real-time statistics</span>
						</div>
					</CardContent>
				</Card>

				{/* Race Controller */}
				<Card className="bg-gray-800/80 border-gray-700 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
							<FaCar className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Race Track
						</CardTitle>
						<CardDescription className="text-gray-300">
							Racing controller
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Gas and brake pedals</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Left/right turn buttons</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Speed indicator</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Leaderboard</span>
						</div>
					</CardContent>
				</Card>

				{/* Tower Defence Controller */}
				<Card className="bg-gray-800/80 border-gray-700 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
							<FaBuilding className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Tower Defence
						</CardTitle>
						<CardDescription className="text-gray-300">
							Strategic controller
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Tower type selection</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Tower upgrade and sale</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Wave management</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Resource statistics</span>
						</div>
					</CardContent>
				</Card>

				{/* Blockchain Integration */}
				<Card className="bg-gray-800/80 border-gray-700 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
							<FaShieldAlt className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Blockchain Integration
						</CardTitle>
						<CardDescription className="text-gray-300">
							Secure and transparent gaming
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Immutable game records</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Decentralized score tracking</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>NFT achievements</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Cryptocurrency rewards</span>
						</div>
					</CardContent>
				</Card>

				{/* Smart Contracts */}
				<Card className="bg-gray-800/80 border-gray-700 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
							<FaBolt className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Smart Contracts
						</CardTitle>
						<CardDescription className="text-gray-300">
							Automated game logic
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Automated payouts</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Fair play verification</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Tournament management</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Leaderboard updates</span>
						</div>
					</CardContent>
				</Card>

				{/* Web3 Features */}
				<Card className="bg-gray-800/80 border-gray-700 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
							<FaDatabase className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Web3 Features
						</CardTitle>
						<CardDescription className="text-gray-300">
							Next-gen gaming experience
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Wallet integration</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Cross-chain compatibility</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>IPFS data storage</span>
						</div>
						<div className="flex items-center space-x-2">
							<FaCheckCircle className="w-4 h-4 text-green-400" />
							<span>Metaverse connectivity</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
