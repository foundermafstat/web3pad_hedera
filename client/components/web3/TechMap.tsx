'use client';

import { useState } from 'react';
import { BlockchainNetwork, BLOCKCHAIN_MAINNET, BLOCKCHAIN_TESTNET } from '@blockchain/network';

export type SupportedNetwork = 'testnet' | 'mainnet';

export interface BlockchainContractsConfig {
interface TechNode {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	status: 'live' | 'deployed' | 'compliant' | 'active';
	category: 'blockchain' | 'frontend' | 'backend' | 'infrastructure';
	position: { x: number; y: number };
	connections: string[];
	features: string[];
}

const techNodes: TechNode[] = [
	{
		id: 'blockchain',
		title: 'Blockchain',
		description: 'Bitcoin-secured smart contracts platform',
		icon: Blocks,
		color: 'text-orange-400',
		bgColor: 'bg-orange-500/20 border-orange-500/30',
		status: 'live',
		category: 'blockchain',
		position: { x: 20, y: 30 },
		connections: ['clarity', 'registry'],
		features: ['Bitcoin Security', 'Smart Contracts', 'NFT Support']
	},
	{
		id: 'registry',
		title: 'Registry Contract',
		description: 'Central hub for game modules',
		icon: Database,
		color: 'text-purple-400',
		bgColor: 'bg-purple-500/20 border-purple-500/30',
		status: 'deployed',
		category: 'blockchain',
		position: { x: 20, y: 60 },
		connections: ['shooter-game', 'nft-trait'],
		features: ['Game Registration', 'Asset Management', 'Server Auth']
	},
	{
		id: 'shooter-game',
		title: 'Shooter Game Contract',
		description: 'Game-specific logic and session management',
		icon: FaGamepad,
		color: 'text-green-400',
		bgColor: 'bg-green-500/20 border-green-500/30',
		status: 'deployed',
		category: 'blockchain',
		position: { x: 40, y: 60 },
		connections: ['sip009', 'sip010'],
		features: ['Session Management', 'Result Verification', 'NFT Progression']
	},
	{
		id: 'sip009',
		title: 'SIP-009 NFTs',
		description: 'Standard NFT implementation',
		icon: Star,
		color: 'text-yellow-400',
		bgColor: 'bg-yellow-500/20 border-yellow-500/30',
		status: 'compliant',
		category: 'blockchain',
		position: { x: 60, y: 30 },
		connections: ['nft-trait'],
		features: ['Standard Interface', 'Metadata Support', 'Transfer Functions']
	},
	{
		id: 'sip010',
		title: 'SIP-010 FTs',
		description: 'Fungible token standard',
		icon: Coins,
		color: 'text-cyan-400',
		bgColor: 'bg-cyan-500/20 border-cyan-500/30',
		status: 'compliant',
		category: 'blockchain',
		position: { x: 60, y: 60 },
		connections: ['ft-trait'],
		features: ['Token Operations', 'Transfer Functions', 'Balance Tracking']
	},
	{
		id: 'nft-trait',
		title: 'NFT Trait',
		description: 'SIP-009 compliant NFT interface',
		icon: Shield,
		color: 'text-indigo-400',
		bgColor: 'bg-indigo-500/20 border-indigo-500/30',
		status: 'deployed',
		category: 'blockchain',
		position: { x: 80, y: 30 },
		connections: ['frontend'],
		features: ['Game Integration', 'Metadata Management', 'Batch Operations']
	},
	{
		id: 'ft-trait',
		title: 'FT Trait',
		description: 'SIP-010 compliant token interface',
		icon: Zap,
		color: 'text-pink-400',
		bgColor: 'bg-pink-500/20 border-pink-500/30',
		status: 'deployed',
		category: 'blockchain',
		position: { x: 80, y: 60 },
		connections: ['backend'],
		features: ['Reward Distribution', 'Staking System', 'Token Locking']
	},
	{
		id: 'frontend',
		title: 'Next.js Frontend',
		description: 'React-based user interface',
		icon: Smartphone,
		color: 'text-blue-400',
		bgColor: 'bg-blue-500/20 border-blue-500/30',
		status: 'active',
		category: 'frontend',
		position: { x: 80, y: 80 },
		connections: ['backend'],
		features: ['Mobile Controllers', 'Real-time Display', 'Wallet Integration']
	},
	{
		id: 'backend',
		title: 'Node.js Backend',
		description: 'Game server and blockchain integration',
		icon: Server,
		color: 'text-green-400',
		bgColor: 'bg-green-500/20 border-green-500/30',
		status: 'active',
		category: 'backend',
		position: { x: 60, y: 80 },
		connections: ['infrastructure'],
		features: ['Game Logic', 'Result Signing', 'Blockchain API']
	},
	{
		id: 'infrastructure',
		title: 'Infrastructure',
		description: 'Deployment and monitoring',
		icon: Globe,
		color: 'text-gray-400',
		bgColor: 'bg-gray-500/20 border-gray-500/30',
		status: 'active',
		category: 'infrastructure',
		position: { x: 40, y: 80 },
		connections: [],
		features: ['PM2 Process Manager', 'Nginx Proxy', 'SSL Certificates']
	}
];

const categories = {
	blockchain: { label: 'Blockchain', color: 'text-orange-400' },
	frontend: { label: 'Frontend', color: 'text-blue-400' },
	backend: { label: 'Backend', color: 'text-green-400' },
	infrastructure: { label: 'Infrastructure', color: 'text-gray-400' }
};

const statusColors = {
	live: 'bg-green-500/20 border-green-500/30 text-green-300',
	deployed: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
	compliant: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
	active: 'bg-gray-500/20 border-gray-500/30 text-gray-300'
};

export function TechMap() {
	const [selectedNode, setSelectedNode] = useState<TechNode | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const filteredNodes = selectedCategory 
		? techNodes.filter(node => node.category === selectedCategory)
		: techNodes;

	return (
		<div className="space-y-6">
			{/* Category Filter */}
			<div className="flex flex-wrap gap-2">
				<Button
					variant={selectedCategory === null ? "default" : "outline"}
					size="sm"
					onClick={() => setSelectedCategory(null)}
					className={selectedCategory === null ? "bg-purple-600 hover:bg-purple-700" : ""}
				>
					All Technologies
				</Button>
				{Object.entries(categories).map(([key, category]) => (
					<Button
						key={key}
						variant={selectedCategory === key ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedCategory(key)}
						className={selectedCategory === key ? "bg-purple-600 hover:bg-purple-700" : ""}
					>
						{category.label}
					</Button>
				))}
			</div>

			{/* Tech Map */}
			<div className="relative w-full h-[600px] bg-slate-900/50 rounded-lg p-8 overflow-hidden border border-slate-700">
				{/* Background Grid */}
				<div className="absolute inset-0 opacity-10">
					<svg width="100%" height="100%" className="absolute inset-0">
						<defs>
							<pattern id="tech-grid" width="50" height="50" patternUnits="userSpaceOnUse">
								<path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-600" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#tech-grid)" />
					</svg>
				</div>

				{/* Connection Lines */}
				<svg className="absolute inset-0 w-full h-full pointer-events-none">
					{techNodes.map((node) =>
						node.connections.map((targetId) => {
							const targetNode = techNodes.find(n => n.id === targetId);
							if (!targetNode) return null;

							const startX = (node.position.x / 100) * 100;
							const startY = (node.position.y / 100) * 100;
							const endX = (targetNode.position.x / 100) * 100;
							const endY = (targetNode.position.y / 100) * 100;

							return (
								<line
									key={`${node.id}-${targetId}`}
									x1={`${startX}%`}
									y1={`${startY}%`}
									x2={`${endX}%`}
									y2={`${endY}%`}
									stroke="currentColor"
									strokeWidth="2"
									strokeDasharray="8,4"
									className="text-slate-500"
								/>
							);
						})
					)}
				</svg>

				{/* Tech Nodes */}
				{filteredNodes.map((node) => {
					const IconComponent = node.icon;
					const isSelected = selectedNode?.id === node.id;
					
					return (
						<div
							key={node.id}
							className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer ${
								isSelected ? 'scale-110 z-10' : 'hover:scale-105'
							}`}
							style={{
								left: `${node.position.x}%`,
								top: `${node.position.y}%`,
							}}
							onClick={() => setSelectedNode(isSelected ? null : node)}
						>
							<Card className={`w-56 ${node.bgColor} border backdrop-blur-sm ${isSelected ? 'ring-2 ring-purple-400' : ''}`}>
								<CardContent className="p-4">
									<div className="flex items-center gap-3 mb-3">
										<IconComponent className={`w-6 h-6 ${node.color}`} />
										<div className="flex-1">
											<h3 className="text-sm font-semibold text-white truncate">{node.title}</h3>
											<Badge 
												variant="outline" 
												className={`text-xs ${statusColors[node.status]}`}
											>
												{node.status}
											</Badge>
										</div>
									</div>
									<p className="text-xs text-gray-400 mb-3">{node.description}</p>
									<div className="flex flex-wrap gap-1">
										{node.features.slice(0, 2).map((feature, index) => (
											<Badge key={index} variant="outline" className="text-xs px-2 py-1">
												{feature}
											</Badge>
										))}
										{node.features.length > 2 && (
											<Badge variant="outline" className="text-xs px-2 py-1">
												+{node.features.length - 2}
											</Badge>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					);
				})}

				{/* Legend */}
				<div className="absolute bottom-4 left-4 bg-slate-800/90 rounded-lg p-4 border border-slate-600">
					<h4 className="text-sm font-semibold text-white mb-2">Status Legend</h4>
					<div className="space-y-1">
						{Object.entries(statusColors).map(([status, className]) => (
							<div key={status} className="flex items-center gap-2">
								<div className={`w-3 h-3 rounded-full border ${className}`}></div>
								<span className="text-xs text-gray-300 capitalize">{status}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Node Details */}
			{selectedNode && (
				<Card className="bg-slate-800/50 border-slate-700">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<selectedNode.icon className={`w-8 h-8 ${selectedNode.color}`} />
								<div>
									<CardTitle className="text-xl text-white">{selectedNode.title}</CardTitle>
									<Badge variant="outline" className={`mt-1 ${statusColors[selectedNode.status]}`}>
										{selectedNode.status}
									</Badge>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedNode(null)}
								className="text-gray-400 hover:text-white"
							>
								×
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-gray-300 mb-4">{selectedNode.description}</p>
						
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h4 className="text-sm font-semibold text-white mb-2">Key Features</h4>
								<div className="space-y-1">
									{selectedNode.features.map((feature, index) => (
										<div key={index} className="flex items-center gap-2 text-sm text-gray-300">
											<FaCheckCircle className="w-3 h-3 text-green-400" />
											{feature}
										</div>
									))}
								</div>
							</div>
							
							<div>
								<h4 className="text-sm font-semibold text-white mb-2">Integration</h4>
								<div className="space-y-1">
									{selectedNode.connections.length > 0 ? (
										selectedNode.connections.map((connectionId) => {
											const connectedNode = techNodes.find(n => n.id === connectionId);
											return connectedNode ? (
												<div key={connectionId} className="flex items-center gap-2 text-sm text-gray-300">
													<FaArrowRight className="w-3 h-3 text-blue-400" />
													{connectedNode.title}
												</div>
											) : null;
										})
									) : (
										<span className="text-sm text-gray-500">No direct connections</span>
									)}
								</div>
							</div>
						</div>

						<div className="mt-4 pt-4 border-t border-slate-600">
							<Button 
								size="sm" 
								className="bg-purple-600 hover:bg-purple-700 text-white"
								onClick={() => {/* Open external link */}}
							>
								<FaExternalLinkAlt className="w-4 h-4 mr-2" />
								View Documentation
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
