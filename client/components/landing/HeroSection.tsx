'use client';

import React from 'react';
import { FaGamepad, FaPlay, FaBullseye, FaQrcode, FaUsers, FaBolt, FaCheckCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroSectionProps {
	onCreateRoomClick: () => void;
}

export default function HeroSection({ onCreateRoomClick }: HeroSectionProps) {
	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-bounce"></div>
				<div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
			</div>

			<div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 text-center">
				{/* Main Hero Content */}
				<div className="space-y-8">
					<div className="space-y-6">
						<div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-2xl mb-8 animate-pulse">
							<FaGamepad className="w-16 h-16 text-white" />
						</div>
						
						<h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tight leading-none">
							<span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
								Web3Pad
							</span>
						</h1>
						
						<p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/90 mb-8">
							Turn any screen into a gaming arena
						</p>
						
						<div className="max-w-4xl mx-auto">
							<p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-4">
								Your smartphone becomes a gamepad in 
								<span className="text-cyan-400 font-bold"> 3 seconds</span>
							</p>
							<p className="text-lg md:text-xl text-gray-300 font-medium">
								<span className="text-white font-bold">No downloads. No installations.</span> Just scan and play.
							</p>
						</div>
					</div>

					{/* Value Props */}
					<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
						<div className="bg-background/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-background/10 transition-all duration-300">
							<FaQrcode className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
							<h3 className="text-xl font-bold text-white mb-2">Instant Connection</h3>
							<p className="text-gray-300">Scan QR code with your phone camera and start playing immediately</p>
						</div>
						<div className="bg-background/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-background/10 transition-all duration-300">
							<FaUsers className="w-12 h-12 text-purple-400 mx-auto mb-4" />
							<h3 className="text-xl font-bold text-white mb-2">Up to 10 Players</h3>
							<p className="text-gray-300">Play with friends and family on one screen simultaneously</p>
						</div>
						<div className="bg-background/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-background/10 transition-all duration-300">
							<FaBolt className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
							<h3 className="text-xl font-bold text-white mb-2">Zero Latency</h3>
							<p className="text-gray-300">WebSocket technology ensures responsive controls like real gamepad</p>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="space-y-6 mt-16">
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Button
								onClick={onCreateRoomClick}
								className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-bold py-6 px-12 text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl hover:scale-105"
							>
								<FaPlay className="w-6 h-6 mr-3" />
								Create Game Room
							</Button>
							<Button
								onClick={() => {
									document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' });
								}}
								variant="outline"
								className="border-white/30 text-white hover:bg-background/10 font-bold py-6 px-12 text-xl rounded-2xl backdrop-blur-xl"
							>
								<FaBullseye className="w-6 h-6 mr-3" />
								Browse Games
							</Button>
						</div>
						
						<div className="flex flex-wrap justify-center items-center gap-4 text-sm">
							<Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
								<FaCheckCircle className="w-4 h-4 mr-2" />
								100% Free
							</Badge>
							<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
								<FaCheckCircle className="w-4 h-4 mr-2" />
								No Registration
							</Badge>
							<Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
								<FaCheckCircle className="w-4 h-4 mr-2" />
								Works on Any Device
							</Badge>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
