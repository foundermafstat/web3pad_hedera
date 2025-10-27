'use client';

import React, { useEffect, useState } from 'react';
import { FaUndo } from 'react-icons/fa';

interface LandscapeOrientationLockProps {
	children: React.ReactNode;
}

const LandscapeOrientationLock: React.FC<LandscapeOrientationLockProps> = ({ children }) => {
	const [isLandscape, setIsLandscape] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkOrientation = () => {
			const isLandscapeMode = window.innerWidth > window.innerHeight;
			const isMobileDevice = window.innerWidth <= 768;
			
			setIsLandscape(isLandscapeMode);
			setIsMobile(isMobileDevice);
		};

		// Check on mount
		checkOrientation();

		// Listen for orientation changes
		window.addEventListener('resize', checkOrientation);
		window.addEventListener('orientationchange', checkOrientation);

		// Try to lock orientation to landscape on mobile (feature-detected)
		const orientation: any = (screen as any).orientation;
		if (orientation && typeof orientation.lock === 'function') {
			orientation.lock('landscape').catch(() => {
				// Orientation lock failed, continue with warning
				console.log('Orientation lock not supported');
			});
		}

		return () => {
			window.removeEventListener('resize', checkOrientation);
			window.removeEventListener('orientationchange', checkOrientation);
		};
	}, []);

	// Show landscape warning for mobile devices in portrait mode
	if (isMobile && !isLandscape) {
		return (
			<div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-orange-900 to-red-900 flex flex-col items-center justify-center p-4 z-50">
				<div className="text-center max-w-md">
					{/* Rotate icon animation */}
					<div className="mb-8">
						<div className="relative w-32 h-32 mx-auto">
							<div className="absolute inset-0 border-4 border-white/30 rounded-lg"></div>
							<div className="absolute inset-0 border-4 border-white border-t-transparent rounded-lg animate-spin"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<FaUndo className="w-16 h-16 text-white animate-pulse" />
							</div>
						</div>
					</div>

					<h1 className="text-3xl font-bold text-white mb-4">
						Rotate your device
					</h1>
					<p className="text-white/80 text-lg mb-6">
						Landscape mode is required
					</p>
					
					<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
						<div className="flex items-center justify-center space-x-4 text-white/90">
							<div className="text-center">
								<div className="w-12 h-8 border-2 border-white/50 rounded mb-2"></div>
								<span className="text-sm">Portrait</span>
							</div>
							<div className="text-2xl">→</div>
							<div className="text-center">
								<div className="w-8 h-12 border-2 border-white rounded mb-2"></div>
								<span className="text-sm text-green-400 font-semibold">Landscape</span>
							</div>
						</div>
					</div>

					<div className="mt-8 text-white/60 text-sm">
						<p>The game is optimized for a horizontal screen</p>
						<p className="mt-1">Rotate your phone left or right</p>
					</div>

					{/* Force landscape button for testing */}
					<button
						onClick={() => {
							// Try to force landscape programmatically
							const orientation: any = (screen as any).orientation;
							if (orientation && typeof orientation.lock === 'function') {
								orientation.lock('landscape');
							}
						}}
						className="mt-6 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors"
					>
							Force rotate
					</button>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

export default LandscapeOrientationLock;
