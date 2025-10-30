'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaPlay, FaUsers, FaClock, FaBullseye, FaChevronLeft, FaChevronRight, FaGamepad, FaBolt, FaTrophy, FaShieldAlt, FaPuzzlePiece, FaCar } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameInfo } from './types';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface GameVideoSliderProps {
	games: Record<string, GameInfo>;
	onCreateRoomClick: () => void;
	onPlayGame: (gameType: string) => void;
}

interface GameSlideData {
	id: string;
	name: string;
	shortDescription: string;
	description: string;
	minPlayers: number;
	maxPlayers: number;
	icon: string;
	videoUrl: string;
	posterUrl: string;
	gradient: string;
	features: string[];
	playTime: string;
	duration: number;
	difficulty: string;
	category: string;
	controls: string[];
	gameMode: string;
	specialFeatures: string[];
}

export default function GameVideoSlider({ games, onCreateRoomClick, onPlayGame }: GameVideoSliderProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [gameSlides, setGameSlides] = useState<GameSlideData[]>([]);
	const [loading, setLoading] = useState(true);
	const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
	const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Function to get game icon based on game type
	const getGameIcon = (gameId: string) => {
		const iconMap: Record<string, React.ReactNode> = {
			'quiz': <FaPuzzlePiece className="w-4 h-4" />,
			'race': <FaCar className="w-4 h-4" />,
			'shooter': <FaBullseye className="w-4 h-4" />,
			'tower-defence': <FaShieldAlt className="w-4 h-4" />,
			'gyro-test': <FaBolt className="w-4 h-4" />,
			'default': <FaGamepad className="w-4 h-4" />
		};
		return iconMap[gameId] || iconMap['default'];
	};
	
	const totalSlides = gameSlides.length;

	// Load slides data from JSON
	useEffect(() => {
		const loadSlidesData = async () => {
			try {
				const response = await fetch('/data/game-slides.json');
				const data = await response.json();
				setGameSlides(data.slides);
				setLoading(false);
			} catch (error) {
				console.error('Error loading slides data:', error);
				setLoading(false);
			}
		};

		loadSlidesData();
	}, []);

	// Generate QR codes for all slides when they load
	useEffect(() => {
		if (gameSlides.length > 0) {
			const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
			const newQrCodes: Record<string, string> = {};
			
			gameSlides.forEach(slide => {
				const roomId = Math.random().toString(36).substring(2, 8);
				newQrCodes[slide.id] = `${baseUrl}/game/${slide.id}?roomId=${roomId}`;
			});
			
			setQrCodes(newQrCodes);
		}
	}, [gameSlides]);

	// Auto-advance slides based on duration from JSON
	useEffect(() => {
		if (gameSlides.length === 0) return;

		const advanceSlide = () => {
			setCurrentSlide((prev) => (prev + 1) % gameSlides.length);
		};

		const scheduleNextSlide = () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			
			const currentSlideData = gameSlides[currentSlide];
			const duration = currentSlideData?.duration || 10000; // fallback to 10 seconds
			
			intervalRef.current = setTimeout(advanceSlide, duration);
		};

		scheduleNextSlide();

		return () => {
			if (intervalRef.current) {
				clearTimeout(intervalRef.current);
			}
		};
	}, [gameSlides.length, currentSlide]);

	// Handle video playback
	useEffect(() => {
		videoRefs.current.forEach((video, index) => {
			if (video) {
				if (index === currentSlide) {
					video.currentTime = 0;
					// Force video to load and play
					video.load();
					video.play().catch(() => {
						// Handle play() failures silently
					});
				} else {
					video.pause();
				}
			}
		});
	}, [currentSlide]);

	// Initial video setup when slides load
	useEffect(() => {
		if (gameSlides.length > 0 && currentSlide === 0) {
			const firstVideo = videoRefs.current[0];
			if (firstVideo) {
				firstVideo.load();
				firstVideo.play().catch(() => {
					// Handle play() failures silently
				});
			}
		}
	}, [gameSlides.length, currentSlide]);

	const goToSlide = (slideIndex: number) => {
		setCurrentSlide(slideIndex);
	};

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % totalSlides);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
	};

	const handlePlayGame = (gameId: string) => {
		onPlayGame(gameId);
	};

	const currentGameSlide = gameSlides[currentSlide];

	// Memoized QR code URL for current slide
	const currentQRUrl = useMemo(() => {
		if (currentGameSlide && qrCodes[currentGameSlide.id]) {
			return qrCodes[currentGameSlide.id];
		}
		return '';
	}, [currentGameSlide, qrCodes]);

	if (loading || totalSlides === 0) {
		return (
			<div className="w-full flex items-center justify-center bg-gradient-to-br from-lime-900 via-yellow-900 to-blue-900">
				<div className="text-center">
					<div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
					<div className="text-white text-2xl font-medium">
						Loading game slider...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="game-video-slider group w-full h-screen overflow-hidden relative">
			{/* Video Backgrounds */}
			{gameSlides.map((slide, index) => (
				<div
					key={slide.id}
					className={`absolute inset-0 transition-opacity duration-1000 ${
						index === currentSlide ? 'opacity-100' : 'opacity-0'
					}`}
				>
					{/* Background - Gradient Fallback */}
					<div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${slide.gradient.replace('/70', '').replace('/50', '').replace('/30', '')}`} />
					
					{/* Video Background (overlay on gradient) */}
					<video
						ref={(el) => { videoRefs.current[index] = el; }}
						className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
						muted
						loop
						playsInline
						onLoadedData={(e) => {
							(e.target as HTMLVideoElement).style.opacity = '1';
						}}
						onError={(e) => {
							// Keep gradient fallback visible if video fails
							(e.target as HTMLVideoElement).style.opacity = '0';
						}}
					>
						<source src={slide.videoUrl} type="video/mp4" />
					</video>
					
					{/* Animated Particles */}
					<div className="absolute inset-0 overflow-hidden z-5">
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className="absolute w-2 h-2 bg-background/20 rounded-full animate-bounce"
								style={{
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
									animationDelay: `${Math.random() * 4}s`,
									animationDuration: `${3 + Math.random() * 2}s`,
								}}
							/>
						))}
						{[...Array(5)].map((_, i) => (
							<div
								key={`circle-${i}`}
								className="absolute border border-white/10 rounded-full animate-pulse"
								style={{
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
									width: `${50 + Math.random() * 100}px`,
									height: `${50 + Math.random() * 100}px`,
									animationDelay: `${Math.random() * 3}s`,
									animationDuration: `${4 + Math.random() * 2}s`,
								}}
							/>
						))}
					</div>

					{/* Darkening Gradient Overlay */}
					<div className="absolute inset-0 bg-gradient-to-tr from-background via-gray-800/50 to-transparent z-10" />
				</div>
			))}

			{/* Navigation Arrows */}
			<button
				onClick={prevSlide}
				className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 z-40 bg-background/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-background/30 transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 touch-manipulation"
				aria-label="Previous slide"
			>
				<FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
			</button>
			<button
				onClick={nextSlide}
				className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 z-40 bg-background/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-background/30 transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 touch-manipulation"
				aria-label="Next slide"
			>
				<FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
			</button>

			{/* Main Content */}
			<div className="absolute bottom-20 sm:bottom-10 z-30 w-full">
				<div className="container mx-auto max-w-7xl px-2 lg:px-4 pb-2 lg:pb-16">
					<div className="flex items-end justify-between">
						{/* Left side - Game description */}
						<div className="max-w-4xl text-left">
							<div className="space-y-4 sm:space-y-6">
								{/* Game Icon and Title */}
								<div className="space-y-4 sm:space-y-6">
									<h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight">
										{currentGameSlide.name}
									</h1>
									
									<p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
										{currentGameSlide.description}
									</p>
								</div>

								{/* Game Stats */}
								<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
									<Badge className="bg-background/20 backdrop-blur-md text-white border-white/30 px-2 py-1 text-xs">
										<FaUsers className="w-3 h-3 mr-1" />
										<span className="hidden sm:inline">{currentGameSlide.minPlayers}-{currentGameSlide.maxPlayers} players</span>
										<span className="sm:hidden">{currentGameSlide.minPlayers}-{currentGameSlide.maxPlayers}</span>
									</Badge>
									<Badge className="bg-background/20 backdrop-blur-md text-white border-white/30 px-2 py-1 text-xs">
										<FaClock className="w-3 h-3 mr-1" />
										{currentGameSlide.playTime}
									</Badge>
								</div>

								{/* Features */}
								<div className="flex flex-wrap gap-1.5 max-w-lg">
									{currentGameSlide.features.slice(0, 6).map((feature, index) => (
										<div 
											key={index}
											className="bg-background/5 border border-white/10 rounded-md px-2 py-1 text-white/80 text-xs font-medium"
										>
											{feature}
										</div>
									))}
								</div>

							{/* CTA Buttons */}
							<div className="space-y-4">
								<div className="flex flex-row gap-3 sm:gap-4 items-start">
									<Button
										onClick={onCreateRoomClick}
										className="bg-primary text-black py-3 sm:py-4 px-4 sm:px-8 text-sm sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-md hover:scale-105 flex-1"
									>
										<FaPlay className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
										<span className="hidden sm:inline">Create Room</span>
										<span className="sm:hidden">Create</span>
									</Button>
									<Button
										onClick={() => handlePlayGame(currentGameSlide.id)}
										variant="outline"
										className="border-white/50 text-white hover:bg-background/20 backdrop-blur-md py-3 sm:py-4 px-4 sm:px-8 text-sm sm:text-lg rounded-md hover:scale-105 transition-all duration-300 flex-1"
									>
										<FaBullseye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
										<span className="hidden sm:inline">Quick Play</span>
										<span className="sm:hidden">Play</span>
									</Button>
								</div>
							</div>
							</div>
						</div>

						{/* Right side - QR Code */}
						{currentGameSlide && currentQRUrl && (
							<div className="hidden lg:flex items-end">
								<QRCodeDisplay 
									url={currentQRUrl} 
									size={188}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Slide Thumbnails */}
			<div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-sm sm:w-auto px-4">
				<div className="flex items-center justify-center space-x-2 sm:space-x-3 overflow-x-auto sm:overflow-visible">
					{gameSlides.map((slide, index) => (
						<button
							key={slide.id}
							onClick={() => goToSlide(index)}
							className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 flex-shrink-0 ${
								index === currentSlide
									? 'bg-background/20 text-white'
									: 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 hover:text-gray-200'
							}`}
						>
							<div className={index === currentSlide ? 'text-white' : 'text-gray-300'}>
								{getGameIcon(slide.id)}
							</div>
							<span className="text-xs sm:text-sm font-medium hidden lg:block">{slide.name}</span>
						</button>
					))}
				</div>
			</div>

		</div>
	);
}
