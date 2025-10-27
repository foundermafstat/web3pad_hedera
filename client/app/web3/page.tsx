'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FaBolt, FaShieldAlt, FaUsers, FaGamepad, FaTrendingUp, FaLink as LinkIcon, FaCheckCircle, FaArrowRight, FaDatabase, FaGlobe, FaLock, FaStar, FaTrophy, FaCoins as Coins, FaLayerGroup, FaMobile, FaExternalLinkAlt, FaCubes, FaClipboardList as ClipboardList } from 'react-icons/fa';
import { getContracts } from '@/lib/blockchain';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function Web3Page() {
	const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'contracts' | 'integration'>('overview');
	const contracts = getContracts();

	const features = [
		{
			icon: FaShieldAlt,
			title: 'Decentralized Results',
			description: 'All game results are stored on the blockchain with cryptographic verification',
			color: 'text-blue-500',
		},
		{
			icon: FaUsers,
			title: 'Player Ownership',
			description: 'Players own their gaming data, achievements, and rewards through blockchain addresses',
			color: 'text-green-500',
		},
		{
			icon: FaTrophy,
			title: 'NFT Rewards',
			description: 'Earn unique NFT achievements and collectibles that are truly yours',
			color: 'text-purple-500',
		},
		{
			icon: Coins,
			title: 'Token Economy',
			description: 'Participate in the gaming economy with fungible tokens and rewards',
			color: 'text-yellow-500',
		},
	];

	const deployedContracts = [
		{
			name: 'Registry Contract',
			address: contracts.registry,
			description: 'Central hub for game modules and asset management',
			features: ['Game Registration', 'Asset Management', 'Server Authorization'],
			lines: 687,
			cost: '0.188320 HBAR',
			category: 'registry',
		},
		{
			name: 'Shooter Game Contract',
			address: contracts.shooterGame,
			description: 'Game-specific logic for Battle Arena',
			features: ['Session Management', 'Result Verification', 'NFT Progression'],
			lines: 614,
			cost: '0.178630 HBAR',
			category: 'game',
		},
		{
			name: 'NFT Trait',
			address: contracts.nftTrait,
			description: 'SIP-009 compliant NFT interface',
			features: ['Standard Operations', 'Game Integration', 'Metadata Management'],
			lines: 125,
			cost: '0.042250 HBAR',
			category: 'nft',
		},
		{
			name: 'FT Trait',
			address: contracts.ftTrait,
			description: 'SIP-010 compliant token interface',
			features: ['Token Operations', 'Staking System', 'Reward Distribution'],
			lines: 154,
			cost: '0.050830 HBAR',
			category: 'ft',
		},
		{
			name: 'NFT Implementation',
			address: contracts.nftImplementation,
			description: 'SIP-009 compliant NFT implementation',
			features: ['NFT Minting', 'Transfer Functions', 'Metadata Storage'],
			lines: 234,
			cost: '0.067890 HBAR',
			category: 'nft',
		},
		{
			name: 'FT Implementation',
			address: contracts.ftImplementation,
			description: 'SIP-010 compliant token implementation',
			features: ['Token Minting', 'Transfer Functions', 'Balance Tracking'],
			lines: 198,
			cost: '0.054320 HBAR',
			category: 'ft',
		},
	];

	const gameFlow = [
		{
			step: 1,
			title: 'Connect Wallet',
			description: 'Players connect their blockchain wallet to the platform',
			icon: LinkIcon,
		},
		{
			step: 2,
			title: 'Start Session',
			description: 'Game session is registered on the blockchain',
			icon: FaGamepad,
		},
		{
			step: 3,
			title: 'Play & Compete',
			description: 'Real-time gameplay with mobile controllers',
			icon: FaMobile,
		},
		{
			step: 4,
			title: 'Verify Results',
			description: 'Game results are cryptographically signed and verified',
			icon: FaShieldAlt,
		},
		{
			step: 5,
			title: 'Earn Rewards',
			description: 'NFTs and tokens are distributed to winners',
			icon: FaTrophy,
		},
	];

	return (
		<PageWithFooter>
			<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="bg-card border border-border rounded-md mb-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-6 lg:pt-16">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-foreground">Web3 Gaming Platform</h1>
							<div className="ml-4 px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-500 border-green-500/20">
								Live on Blockchain Testnet
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<Badge variant="outline" className="border-primary/30 text-primary">
								<FaCheckCircle className="w-3 h-3 mr-1" />
								Fully Decentralized
							</Badge>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-card border border-border rounded-md mb-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<nav className="flex space-x-8">
						{[
							{ id: 'overview', name: 'Overview', icon: <ClipboardList className="w-4 h-4" /> },
							{ id: 'architecture', name: 'Architecture', icon: <FaLayerGroup className="w-4 h-4" /> },
							{ id: 'contracts', name: 'Smart Contracts', icon: <FaDatabase className="w-4 h-4" /> },
							{ id: 'integration', name: 'Integration', icon: <FaDatabase className="w-4 h-4" /> }
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as any)}
								className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
									activeTab === tab.id
										? 'border-primary text-primary'
										: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
								}`}
							>
								<span className={`mr-2 inline-flex items-center justify-center w-6 h-6 rounded-md ${
									activeTab === tab.id
										? 'bg-primary/50 text-primary'
										: 'bg-muted text-muted-foreground'
								}`}>
									{tab.icon}
								</span>
								{tab.name}
							</button>
						))}
					</nav>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="space-y-6">
					{/* Overview Tab */}
					{activeTab === 'overview' && (
						<div className="space-y-6">
							{/* Features Grid */}
							<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
								{features.map((feature, index) => (
									<Card key={index} className="bg-card border border-border hover:border-primary/50 transition-colors">
										<CardContent className="p-6">
											<div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/50 text-primary mb-4">
												<feature.icon className="w-6 h-6" />
											</div>
											<h3 className="text-lg font-semibold text-foreground mb-2">
												{feature.title}
											</h3>
											<p className="text-muted-foreground text-sm">{feature.description}</p>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Game Flow */}
							<Card className="bg-card border border-border">
								<CardHeader>
									<CardTitle className="text-xl text-foreground flex items-center gap-2">
										<FaGamepad className="w-5 h-5 text-primary" />
										Gaming Flow
									</CardTitle>
									<CardDescription className="text-muted-foreground">
										From wallet connection to reward distribution
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid md:grid-cols-5 gap-6">
										{gameFlow.map((step, index) => (
											<div key={step.step} className="text-center">
												<div className="relative mb-4">
													<div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
														<step.icon className="w-8 h-8 text-primary" />
													</div>
													{index < gameFlow.length - 1 && (
														<div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-primary/30 transform translate-x-4"></div>
													)}
												</div>
												<h3 className="text-lg font-semibold text-foreground mb-2">
													{step.title}
												</h3>
												<p className="text-sm text-muted-foreground">{step.description}</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Architecture Tab */}
					{activeTab === 'architecture' && (
						<div className="space-y-6">
							<Card className="bg-card border border-border">
								<CardHeader>
									<CardTitle className="text-xl text-foreground flex items-center gap-2">
										<FaLayerGroup className="w-5 h-5 text-primary" />
										System Architecture
									</CardTitle>
									<CardDescription className="text-muted-foreground">
										How blockchain integration works in W3P platform
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* Architecture Description */}
										<div className="prose prose-slate max-w-none">
											<h3 className="text-lg font-semibold text-foreground mb-4">Blockchain Integration Process</h3>
											<div className="space-y-4 text-muted-foreground">
												<p>
													The W3P platform implements a hybrid architecture where games are created off-chain for optimal performance, 
													but all critical data and results are permanently recorded on the blockchain.
												</p>
												<div className="bg-muted/30 p-4 rounded-lg border border-border">
													<h4 className="font-semibold text-foreground mb-2">Key Integration Points:</h4>
													<ul className="list-disc list-inside space-y-1">
														<li>Game sessions are registered on-chain before gameplay begins</li>
														<li>Results are cryptographically signed by the server and verified on-chain</li>
														<li>NFTs are minted with game metadata and final results as immutable records</li>
														<li>All player achievements and rewards are stored as blockchain assets</li>
													</ul>
												</div>
											</div>
										</div>

										{/* Architecture Diagram */}
										<div className="relative w-full h-[600px] bg-muted/10 rounded-lg p-8 overflow-hidden border border-border">
											{/* Background Grid */}
											<div className="absolute inset-0 opacity-10">
												<svg width="100%" height="100%" className="absolute inset-0">
													<defs>
														<pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
															<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
														</pattern>
													</defs>
													<rect width="100%" height="100%" fill="url(#arch-grid)" />
												</svg>
											</div>

											{/* Connection Lines */}
											<svg className="absolute inset-0 w-full h-full pointer-events-none">
												{/* Player to Server */}
												<line x1="15%" y1="20%" x2="35%" y2="35%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
												{/* Server to Registry */}
												<line x1="35%" y1="35%" x2="15%" y2="60%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
												{/* Server to Game Contract */}
												<line x1="35%" y1="35%" x2="35%" y2="60%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
												{/* Server to Database */}
												<line x1="35%" y1="35%" x2="55%" y2="60%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
												{/* Game Contract to NFT */}
												<line x1="35%" y1="60%" x2="75%" y2="35%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
												{/* Game Contract to FT */}
												<line x1="35%" y1="60%" x2="75%" y2="60%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
												{/* Registry to NFT/FT */}
												<line x1="15%" y1="60%" x2="75%" y2="35%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
												<line x1="15%" y1="60%" x2="75%" y2="60%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/60" />
											</svg>

											{/* Architecture Nodes */}
											{/* Player Layer */}
											<div className="absolute top-[15%] left-[10%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-48 bg-primary/10 border-primary/30">
													<CardContent className="p-4 text-center">
														<FaUsers className="w-8 h-8 text-primary mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">Players</h3>
														<p className="text-xs text-muted-foreground">Mobile Controllers & Wallets</p>
													</CardContent>
												</Card>
											</div>

											{/* Server Layer */}
											<div className="absolute top-[30%] left-[30%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-52 bg-green-500/10 border-green-500/30">
													<CardContent className="p-4 text-center">
														<FaDatabase className="w-8 h-8 text-green-500 mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">Game Server</h3>
														<p className="text-xs text-muted-foreground">Real-time Game Logic & Signing</p>
													</CardContent>
												</Card>
											</div>

											{/* Registry Contract */}
											<div className="absolute top-[55%] left-[10%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-48 bg-purple-500/10 border-purple-500/30">
													<CardContent className="p-4 text-center">
														<FaDatabase className="w-8 h-8 text-purple-500 mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">Registry Contract</h3>
														<p className="text-xs text-muted-foreground">Game Modules & Authorization</p>
													</CardContent>
												</Card>
											</div>

											{/* Game Contract */}
											<div className="absolute top-[55%] left-[30%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-48 bg-blue-500/10 border-blue-500/30">
													<CardContent className="p-4 text-center">
														<FaGamepad className="w-8 h-8 text-blue-500 mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">Shooter Game Contract</h3>
														<p className="text-xs text-muted-foreground">Session Management & Results</p>
													</CardContent>
												</Card>
											</div>

											{/* Database */}
											<div className="absolute top-[55%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-48 bg-orange-500/10 border-orange-500/30">
													<CardContent className="p-4 text-center">
														<FaDatabase className="w-8 h-8 text-orange-500 mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">Database</h3>
														<p className="text-xs text-muted-foreground">Session & Player Data</p>
													</CardContent>
												</Card>
											</div>

											{/* NFT Contract */}
											<div className="absolute top-[30%] left-[70%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-48 bg-cyan-500/10 border-cyan-500/30">
													<CardContent className="p-4 text-center">
														<FaStar className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">NFT Contracts</h3>
														<p className="text-xs text-muted-foreground">SIP-009 Compliant</p>
													</CardContent>
												</Card>
											</div>

											{/* FT Contract */}
											<div className="absolute top-[55%] left-[70%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-48 bg-yellow-500/10 border-yellow-500/30">
													<CardContent className="p-4 text-center">
														<Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">FT Contracts</h3>
														<p className="text-xs text-muted-foreground">SIP-010 Compliant</p>
													</CardContent>
												</Card>
											</div>

											{/* Blockchain */}
											<div className="absolute top-[75%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
												<Card className="w-56 bg-slate-800/50 border-slate-600">
													<CardContent className="p-4 text-center">
														<FaCubes className="w-8 h-8 text-slate-400 mx-auto mb-2" />
														<h3 className="text-sm font-semibold text-foreground mb-1">Blockchain</h3>
														<p className="text-xs text-muted-foreground">Smart Contracts</p>
													</CardContent>
												</Card>
											</div>

											{/* Data Flow Indicators */}
											<div className="absolute top-4 left-4">
												<div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 border border-primary/20">
													<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
													<span className="text-xs text-primary font-medium">Data Flow</span>
												</div>
											</div>

											<div className="absolute top-4 right-4">
												<div className="flex items-center gap-2 bg-green-500/10 rounded-full px-3 py-1 border border-green-500/20">
													<FaShieldAlt className="w-3 h-3 text-green-500" />
													<span className="text-xs text-green-500 font-medium">Secure & Verified</span>
												</div>
											</div>

											{/* Legend */}
											<div className="absolute bottom-4 left-4 bg-card/90 rounded-lg p-3 border border-border">
												<h4 className="text-xs font-semibold text-foreground mb-2">Process Flow</h4>
												<div className="space-y-1 text-xs text-muted-foreground">
													<div className="flex items-center gap-2">
														<div className="w-2 h-2 bg-primary rounded-full"></div>
														<span>1. Player connects wallet</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="w-2 h-2 bg-green-500 rounded-full"></div>
														<span>2. Game session registered</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
														<span>3. Results signed & verified</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
														<span>4. NFTs minted with metadata</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Contracts Tab */}
					{activeTab === 'contracts' && (
						<div className="space-y-6">
							<Card className="bg-card border border-border">
								<CardHeader>
									<CardTitle className="text-xl text-foreground flex items-center gap-2">
										<FaDatabase className="w-5 h-5 text-primary" />
										Deployed Smart Contracts
									</CardTitle>
									<CardDescription className="text-muted-foreground">
										Live contracts on Blockchain Testnet with detailed specifications
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-6">
										{deployedContracts.map((contract, index) => (
											<Card key={index} className="bg-muted/20 border border-border">
												<CardHeader>
													<div className="flex items-center justify-between">
														<div>
															<CardTitle className="text-lg text-foreground">{contract.name}</CardTitle>
															<CardDescription className="text-muted-foreground mt-1">
																{contract.description}
															</CardDescription>
														</div>
														<Badge variant="outline" className="border-green-500/30 text-green-500">
															<FaCheckCircle className="w-3 h-3 mr-1" />
															Deployed
														</Badge>
													</div>
												</CardHeader>
												<CardContent>
													<div className="space-y-4">
														<div>
															<h4 className="text-sm font-medium text-foreground mb-2">Contract Address</h4>
															<div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
																<code className="text-sm text-primary flex-1 font-mono">
																	{contract.address}
																</code>
																<Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
																	<FaExternalLinkAlt className="w-4 h-4" />
																</Button>
															</div>
														</div>

														<div className="grid md:grid-cols-2 gap-4">
															<div>
																<h4 className="text-sm font-medium text-foreground mb-2">Key Features</h4>
																<div className="space-y-1">
																	{contract.features.map((feature, featureIndex) => (
																		<div key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
																			<FaCheckCircle className="w-3 h-3 text-green-500" />
																			{feature}
																		</div>
																	))}
																</div>
															</div>

															<div>
																<h4 className="text-sm font-medium text-foreground mb-2">Deployment Stats</h4>
																<div className="space-y-2">
																	<div className="flex justify-between text-sm">
																		<span className="text-muted-foreground">Lines of Code:</span>
																		<span className="text-foreground font-mono">{contract.lines}</span>
																	</div>
																	<div className="flex justify-between text-sm">
																		<span className="text-muted-foreground">Deployment Cost:</span>
																		<span className="text-foreground font-mono">{contract.cost}</span>
																	</div>
																	<div className="flex justify-between text-sm">
																		<span className="text-muted-foreground">Category:</span>
																		<Badge variant="outline" className="text-xs">
																			{contract.category.toUpperCase()}
																		</Badge>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Integration Tab */}
					{activeTab === 'integration' && (
						<div className="space-y-6">
							<Card className="bg-card border border-border">
								<CardHeader>
									<CardTitle className="text-xl text-foreground flex items-center gap-2">
										<FaDatabase className="w-5 h-5 text-primary" />
										Blockchain Integration Details
									</CardTitle>
									<CardDescription className="text-muted-foreground">
										Technical implementation of game-to-blockchain integration
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* Integration Process */}
										<div className="space-y-4">
											<h3 className="text-lg font-semibold text-foreground">Integration Process</h3>
											<div className="space-y-4">
												<div className="bg-muted/20 p-4 rounded-lg border border-border">
													<h4 className="font-semibold text-foreground mb-2">1. Game Creation (Off-chain)</h4>
													<p className="text-muted-foreground text-sm">
														Games are created and run on our servers for optimal performance. 
														All game logic, physics, and real-time interactions happen off-chain.
													</p>
												</div>
												<div className="bg-muted/20 p-4 rounded-lg border border-border">
													<h4 className="font-semibold text-foreground mb-2">2. Session Registration (On-chain)</h4>
													<p className="text-muted-foreground text-sm">
														Before gameplay begins, a session is registered on the blockchain with player addresses, 
														game parameters, and a unique session ID.
													</p>
												</div>
												<div className="bg-muted/20 p-4 rounded-lg border border-border">
													<h4 className="font-semibold text-foreground mb-2">3. Result Verification (Hybrid)</h4>
													<p className="text-muted-foreground text-sm">
														Game results are cryptographically signed by the server and verified on-chain. 
														This ensures authenticity while maintaining performance.
													</p>
												</div>
												<div className="bg-muted/20 p-4 rounded-lg border border-border">
													<h4 className="font-semibold text-foreground mb-2">4. NFT Creation (On-chain)</h4>
													<p className="text-muted-foreground text-sm">
														NFTs are minted with game metadata, final results, and achievement data. 
														These become permanent, verifiable records of gaming achievements.
													</p>
												</div>
											</div>
										</div>

										{/* Technical Specifications */}
										<div className="space-y-4">
											<h3 className="text-lg font-semibold text-foreground">Technical Specifications</h3>
											<div className="grid md:grid-cols-2 gap-4">
												<div className="bg-muted/20 p-4 rounded-lg border border-border">
													<h4 className="font-semibold text-foreground mb-2">Blockchain</h4>
													<ul className="text-sm text-muted-foreground space-y-1">
														<li>• Blockchain Testnet (Bitcoin-secured)</li>
														<li>• Smart contracts</li>
														<li>• NFT standard</li>
														<li>• FT standard</li>
													</ul>
												</div>
												<div className="bg-muted/20 p-4 rounded-lg border border-border">
													<h4 className="font-semibold text-foreground mb-2">Security</h4>
													<ul className="text-sm text-muted-foreground space-y-1">
														<li>• secp256k1 signature verification</li>
														<li>• Replay attack protection</li>
														<li>• Multi-tier access control</li>
														<li>• Cryptographic result signing</li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>
		</div>
		</PageWithFooter>
	);
}
