'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FaMobile, Server, FaCubes, FaDatabase, FaShieldAlt, FaBolt, FaUsers, FaGamepad } from 'react-icons/fa';

interface ArchitectureNode {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	position: { x: number; y: number };
	connections: string[];
}

const nodes: ArchitectureNode[] = [
	{
		id: 'client',
		title: 'Client Layer',
		description: 'Mobile controllers & game display',
		icon: Smartphone,
		color: 'text-blue-400',
		bgColor: 'bg-blue-500/20 border-blue-500/30',
		position: { x: 50, y: 20 },
		connections: ['server']
	},
	{
		id: 'server',
		title: 'Server Layer',
		description: 'Game logic & blockchain integration',
		icon: Server,
		color: 'text-green-400',
		bgColor: 'bg-green-500/20 border-green-500/30',
		position: { x: 50, y: 50 },
		connections: ['blockchain', 'database']
	},
	{
		id: 'blockchain',
		title: 'Blockchain Layer',
		description: 'Blockchain smart contracts',
		icon: Blocks,
		color: 'text-purple-400',
		bgColor: 'bg-purple-500/20 border-purple-500/30',
		position: { x: 20, y: 80 },
		connections: ['nft', 'ft']
	},
	{
		id: 'database',
		title: 'Database',
		description: 'Session & player data',
		icon: Database,
		color: 'text-orange-400',
		bgColor: 'bg-orange-500/20 border-orange-500/30',
		position: { x: 80, y: 80 },
		connections: []
	},
	{
		id: 'nft',
		title: 'NFT Contracts',
		description: 'SIP-009 compliant NFTs',
		icon: Shield,
		color: 'text-cyan-400',
		bgColor: 'bg-cyan-500/20 border-cyan-500/30',
		position: { x: 10, y: 100 },
		connections: []
	},
	{
		id: 'ft',
		title: 'FT Contracts',
		description: 'SIP-010 compliant tokens',
		icon: Zap,
		color: 'text-yellow-400',
		bgColor: 'bg-yellow-500/20 border-yellow-500/30',
		position: { x: 30, y: 100 },
		connections: []
	}
];

export function ArchitectureDiagram() {
	return (
		<div className="relative w-full h-[600px] bg-slate-900/50 rounded-lg p-8 overflow-hidden">
			{/* Background Grid */}
			<div className="absolute inset-0 opacity-20">
				<svg width="100%" height="100%" className="absolute inset-0">
					<defs>
						<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-700" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#grid)" />
				</svg>
			</div>

			{/* Connection Lines */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				{nodes.map((node) =>
					node.connections.map((targetId) => {
						const targetNode = nodes.find(n => n.id === targetId);
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
								strokeDasharray="5,5"
								className="text-slate-600 animate-pulse"
							/>
						);
					})
				)}
			</svg>

			{/* Nodes */}
			{nodes.map((node) => {
				const IconComponent = node.icon;
				return (
					<div
						key={node.id}
						className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-105`}
						style={{
							left: `${node.position.x}%`,
							top: `${node.position.y}%`,
						}}
					>
						<Card className={`w-48 ${node.bgColor} border backdrop-blur-sm`}>
							<CardContent className="p-4 text-center">
								<IconComponent className={`w-8 h-8 ${node.color} mx-auto mb-2`} />
								<h3 className="text-sm font-semibold text-white mb-1">{node.title}</h3>
								<p className="text-xs text-gray-400">{node.description}</p>
							</CardContent>
						</Card>
					</div>
				);
			})}

			{/* Data Flow Indicators */}
			<div className="absolute top-4 left-1/2 transform -translate-x-1/2">
				<div className="flex items-center gap-2 bg-slate-800/80 rounded-full px-4 py-2 border border-slate-600">
					<FaUsers className="w-4 h-4 text-blue-400" />
					<span className="text-sm text-gray-300">Players</span>
					<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
				</div>
			</div>

			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
				<div className="flex items-center gap-2 bg-slate-800/80 rounded-full px-4 py-2 border border-slate-600">
					<FaGamepad className="w-4 h-4 text-green-400" />
					<span className="text-sm text-gray-300">Game Results</span>
					<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
				</div>
			</div>
		</div>
	);
}
