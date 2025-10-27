'use client';

import React from 'react';
import { FaCheckCircle, FaGift, FaBuilding, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UseCasesSection() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
			<div className="text-center space-y-4">
				<h2 className="text-4xl font-bold text-white">
					Who is this perfect for?
				</h2>
			</div>

			<div className="grid md:grid-cols-2 gap-8">
				<Card className="bg-gray-800/80 border-gray-700 backdrop-blur-lg">
					<CardHeader>
						<CardTitle className="text-2xl text-white font-bold flex items-center">
							<div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-gray-500/20 text-gray-400 mr-3">
								<FaGift className="w-6 h-6" />
							</div>
							Parties and events
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300 space-y-3">
						<p>
							Turn any party into an unforgettable event! Guests connect
							instantly—just scan the QR code and start playing.
						</p>
						<ul className="space-y-2 text-sm">
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>
									No need to hand out controllers or explain controls
								</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Players can join and leave at any time</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Support for up to 10 players simultaneously</span>
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-700/50 backdrop-blur-lg">
					<CardHeader>
						<CardTitle className="text-2xl text-white font-bold flex items-center">
							<div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-blue-500/20 text-blue-400 mr-3">
								<FaBuilding className="w-6 h-6" />
							</div>
							Corporate events
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300 space-y-3">
						<p>
							Perfect solution for team building, conference breaks, and
							corporate events.
						</p>
						<ul className="space-y-2 text-sm">
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Quick launch without technical preparation</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Works on corporate equipment</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Data stays in the company's local network</span>
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700/50 backdrop-blur-lg">
					<CardHeader>
						<CardTitle className="text-2xl text-white font-bold flex items-center">
							<div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-green-500/20 text-green-400 mr-3">
								<FaUsers className="w-6 h-6" />
							</div>
							Family games
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300 space-y-3">
						<p>
							Bring the family together for an exciting game! Simple
							controls are clear even to children and grandmas.
						</p>
						<ul className="space-y-2 text-sm">
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Intuitive controllers</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Play from any device in the house</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Safe for children</span>
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-700/50 backdrop-blur-lg">
					<CardHeader>
						<CardTitle className="text-2xl text-white font-bold flex items-center">
							<div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-orange-500/20 text-orange-400 mr-3">
								<FaMapMarkerAlt className="w-6 h-6" />
							</div>
							Interactive zones
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300 space-y-3">
						<p>
							Create a gaming zone at an event, cafe, or shopping center.
							Visitors play without registration!
						</p>
						<ul className="space-y-2 text-sm">
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Instant connection via QR</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>No administration required</span>
							</li>
							<li className="flex items-start">
								<FaCheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
								<span>Scales to large screens</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
