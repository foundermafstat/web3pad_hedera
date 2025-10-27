'use client';

import React from 'react';
import { FaPlay, FaCheckCircle } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FinalCTASection() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-20">
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
				<Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 backdrop-blur-xl overflow-hidden">
					<div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5"></div>
					<CardContent className="relative py-16 text-center space-y-8">
						<div className="space-y-4">
							<h2 className="text-5xl font-bold text-white">
								Ready to start playing?
							</h2>
							<p className="text-gray-300 text-xl max-w-3xl mx-auto">
								Choose a game above and turn any screen into a gaming arena in
								seconds!
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
							<Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-8 py-4 text-base hover:text-[#000000]">
								<FaCheckCircle className="w-5 h-5 mr-2" />
								No app installation
							</Badge>
							<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-8 py-4 text-base hover:text-[#000000]">
								<FaCheckCircle className="w-5 h-5 mr-2" />
								Blockchain-based
							</Badge>
							<Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-8 py-4 text-base hover:text-[#000000]">
								<FaCheckCircle className="w-5 h-5 mr-2" />
								Up to 10 players
							</Badge>
						</div>

						<div className="pt-8">
							<Button
								onClick={() => {
									window.scrollTo({ top: 0, behavior: 'smooth' });
								}}
								className="bg-primary hover:opacity-90 text-primary-foreground py-6 px-14 text-xl shadow-2xl hover:shadow-3xl transition-all duration-200 rounded-full hover:scale-105"
							>
								<FaPlay className="w-6 h-6 mr-1" />
								Choose game
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
