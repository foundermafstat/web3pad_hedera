'use client';

import React from 'react';
import { FaGamepad, FaWifi, FaQrcode, FaMobile, FaShieldAlt, FaDesktop, FaArrowRight } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TechnologySection() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-10">
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl blur-xl"></div>
				<Card className="relative bg-gray-800/80 border-gray-700 backdrop-blur-xl overflow-hidden">
					<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
					<CardHeader className="relative">
						<div className="flex items-center justify-center mb-6">
							<div className="bg-primary/20 p-4 rounded-2xl">
								<FaGamepad className="w-12 h-12 text-primary" />
							</div>
						</div>
						<CardTitle className="text-4xl text-white text-center font-bold mb-4">
							How does mobile controller technology work?
						</CardTitle>
						<CardDescription className="text-gray-300 text-center text-lg">
							Revolutionary control system without apps
						</CardDescription>
					</CardHeader>
					<CardContent className="relative space-y-8">
						{/* Technology breakdown */}
						<div className="grid md:grid-cols-2 gap-6">
							<div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
								<div className="flex items-start space-x-4">
									<div className="bg-primary/20 p-3 rounded-md">
										<FaWifi className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h4 className="text-lg font-bold text-white mb-2">
											WebSocket Real-Time
										</h4>
										<p className="text-gray-400 text-sm leading-relaxed">
											We use WebSocket for instant data transmission between
											phone and screen. Every button press is transmitted in
											milliseconds without delay.
										</p>
									</div>
								</div>
							</div>

							<div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
								<div className="flex items-start space-x-4">
									<div className="bg-primary/20 p-3 rounded-md">
										<FaQrcode className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h4 className="text-lg font-bold text-white mb-2">
											Instant connection
										</h4>
										<p className="text-gray-400 text-sm leading-relaxed">
											The QR code contains a unique room ID. Scanning
											automatically connects your phone to the game via the
											local network.
										</p>
									</div>
								</div>
							</div>

							<div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
								<div className="flex items-start space-x-4">
										<div className="bg-primary/20 p-3 rounded-md">
										<FaMobile className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h4 className="text-lg font-bold text-white mb-2">
											Adaptive interface
										</h4>
										<p className="text-gray-400 text-sm leading-relaxed">
											The controller interface automatically adapts to the
											game type: joysticks for shooter, gas/brake buttons for
											racing, tower menu for tower defence.
										</p>
									</div>
								</div>
							</div>

							<div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
								<div className="flex items-start space-x-4">
									<div className="bg-primary/20 p-3 rounded-md">
										<FaShieldAlt className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h4 className="text-lg font-bold text-white mb-2">
											Local network
										</h4>
										<p className="text-gray-400 text-sm leading-relaxed">
											All data stays in your local network. No data is sent to
											external servers—complete privacy and security.
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Visual diagram */}
						<div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl p-8 border border-gray-700">
							<div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
								<div className="flex-1 text-center">
									<div className="bg-gray-700 p-6 rounded-2xl inline-block mb-4">
										<FaDesktop className="w-16 h-16 text-primary mx-auto mb-2" />
										<div className="text-white font-bold">Game screen</div>
										<div className="text-gray-400 text-sm">TV / Monitor</div>
									</div>
								</div>

								<div className="flex items-center">
									<div className="flex flex-col items-center">
										<FaArrowRight className="w-8 h-8 text-primary mb-2 animate-pulse" />
										<div className="text-center">
											<div className="text-green-400 font-bold text-sm">
												WebSocket
											</div>
											<div className="text-gray-400 text-xs">{'<'}20ms</div>
										</div>
										<FaArrowRight className="w-8 h-8 text-green-400 mt-2 rotate-180 animate-pulse" />
									</div>
								</div>

								<div className="flex-1 text-center">
									<div className="bg-gray-700 p-6 rounded-2xl inline-block mb-4">
										<FaMobile className="w-16 h-16 text-primary mx-auto mb-2" />
										<div className="text-white font-bold">Controller</div>
										<div className="text-gray-400 text-sm">
											iPhone / Android
										</div>
									</div>
								</div>
							</div>

							<div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
								<div className="bg-gray-800/50 rounded-md p-4">
									<div className="text-2xl font-bold text-primary mb-1">
										60 FPS
									</div>
									<div className="text-gray-400 text-sm">Update rate</div>
								</div>
								<div className="bg-gray-800/50 rounded-md p-4">
									<div className="text-2xl font-bold text-primary mb-1">
										10+ players
									</div>
									<div className="text-gray-400 text-sm">Simultaneously</div>
								</div>
								<div className="bg-gray-800/50 rounded-md p-4">
									<div className="text-2xl font-bold text-primary mb-1">
										0 installs
									</div>
									<div className="text-gray-400 text-sm">
										Works in browser
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
