'use client';

import React from 'react';
import { FaMobile, FaDesktop, FaQrcode, FaWifi } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';

export default function HowItWorksSection() {
	return (
		<div className="max-w-7xl mx-auto px-4 space-y-12">
			<div className="text-center space-y-4">
				<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-6 py-3 text-base hover:bg-blue-500/30">
					<FaMobile className="w-5 h-5 mr-2" />
					Mobile controller system
				</Badge>
				<h2 className="text-5xl font-bold text-white">
					Your smartphone is your gamepad
				</h2>
				<p className="text-gray-300 text-xl max-w-3xl mx-auto">
					Revolutionary technology turns any smartphone into a full-fledged
					game controller without installing apps
				</p>
			</div>

			{/* Step-by-step visual guide */}
			<div className="grid md:grid-cols-3 gap-8">
				<div className="relative">
					<div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/30 rounded-3xl p-8 hover:border-green-400/50 transition-all duration-300 h-full">
						<div className="absolute -top-6 left-8 bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
							1
						</div>
						<FaDesktop className="w-16 h-16 text-green-400 mb-6 mt-4" />
						<h3 className="text-2xl font-bold text-white mb-4">
							Open game on a screen
						</h3>
						<p className="text-gray-300 text-base leading-relaxed">
							Launch any game on your TV, monitor, or projector. The system
							will automatically create a unique game room and generate a QR
							code for connection.
						</p>
						<div className="mt-6 bg-gray-900/50 rounded-md p-4 border border-gray-700">
							<div className="text-sm text-gray-400 mb-2">Supported:</div>
							<div className="flex flex-wrap gap-2">
								<Badge className="bg-gray-800 text-gray-300 hover:text-[#000000]">
									Smart TV
								</Badge>
								<Badge className="bg-gray-800 text-gray-300 hover:text-[#000000]">
									Computer
								</Badge>
								<Badge className="bg-gray-800 text-gray-300 hover:text-[#000000]">
									Projector
								</Badge>
							</div>
						</div>
					</div>
				</div>

				<div className="relative">
					<div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-2 border-blue-500/30 rounded-3xl p-8 hover:border-blue-400/50 transition-all duration-300 h-full">
						<div className="absolute -top-6 left-8 bg-gradient-to-r from-blue-500 to-cyan-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
							2
						</div>
						<FaQrcode className="w-16 h-16 text-blue-400 mb-6 mt-4" />
						<h3 className="text-2xl font-bold text-white mb-4">
							Scan the QR code
						</h3>
						<p className="text-gray-300 text-base leading-relaxed">
							Open the camera on your smartphone and point it at the QR
							code. The browser will automatically open the controller. No
							apps, no registrations—everything works through the web
							browser!
						</p>
						<div className="mt-6 bg-gray-900/50 rounded-md p-4 border border-gray-700">
							<div className="text-sm text-gray-400 mb-2">
								Works on any phone:
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge className="bg-gray-800 text-gray-300 hover:text-[#000000]">iPhone</Badge>
								<Badge className="bg-gray-800 text-gray-300 hover:text-[#000000]">Android</Badge>
								<Badge className="bg-gray-800 text-gray-300 hover:text-[#000000]">
									Any browser
								</Badge>
							</div>
						</div>
					</div>
				</div>

				<div className="relative">
					<div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-2 border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-300 h-full">
						<div className="absolute -top-6 left-8 bg-gradient-to-r from-purple-500 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
							3
						</div>
						<FaMobile className="w-16 h-16 text-purple-400 mb-6 mt-4" />
						<h3 className="text-2xl font-bold text-white mb-4">
							Play from your phone!
						</h3>
						<p className="text-gray-300 text-base leading-relaxed">
							Your smartphone turns into a full-fledged gamepad with
							joysticks, action buttons, and adaptive interface. Control
							your character and compete with friends!
						</p>
						<div className="mt-6 bg-gray-900/50 rounded-md p-4 border border-gray-700">
							<div className="text-sm text-gray-400 mb-2">
								Instant response:
							</div>
							<div className="flex items-center space-x-2">
								<FaWifi className="w-4 h-4 text-green-400" />
								<span className="text-green-400 font-semibold">
									{'<'}20ms latency
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
