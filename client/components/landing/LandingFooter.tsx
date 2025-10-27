'use client';

import React from 'react';
import { FaGamepad } from 'react-icons/fa';

export default function LandingFooter() {
	return (
		<div className="text-center py-12 border-t border-gray-700/50">
			<div className="space-y-4">
				<div className="flex items-center justify-center space-x-2 text-gray-400">
					<FaGamepad className="w-5 h-5" />
					<span className="font-medium">Web3Pad</span>
				</div>
				<p className="text-gray-500 text-sm">
					Technologies: React, Next.js, PixiJS, Socket.IO, TypeScript
				</p>
			</div>
		</div>
	);
}
