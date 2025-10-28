'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaArrowUp, FaBolt, FaShieldAlt, FaDatabase, FaExchangeAlt, FaGlobe, FaClock, FaCheckCircle } from 'react-icons/fa';

const Activity = FaExchangeAlt;
const Shield = FaShieldAlt;
const Database = FaDatabase;
const Zap = FaBolt;

interface StatCard {
	title: string;
	value: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	trend?: string;
}

const stats: StatCard[] = [
	{
		title: 'Total Transactions',
		value: '2,847',
		description: 'Game results recorded on blockchain',
		icon: Activity,
		color: 'text-blue-400',
		bgColor: 'bg-blue-500/10 border-blue-500/20',
		trend: '+12%'
	},
	{
		title: 'Active Players',
		value: '1,234',
		description: 'Connected blockchain addresses',
		icon: Shield,
		color: 'text-green-400',
		bgColor: 'bg-green-500/10 border-green-500/20',
		trend: '+8%'
	},
	{
		title: 'NFTs Minted',
		value: '856',
		description: 'Unique achievements created',
		icon: Database,
		color: 'text-purple-400',
		bgColor: 'bg-purple-500/10 border-purple-500/20',
		trend: '+25%'
	},
	{
		title: 'Gas Efficiency',
		value: '274 μHBAR',
		description: 'Average cost per line of code',
		icon: Zap,
		color: 'text-yellow-400',
		bgColor: 'bg-yellow-500/10 border-yellow-500/20',
		trend: '-5%'
	}
];

const networkInfo = [
	{
		label: 'Network',
		value: 'Blockchain Testnet',
		status: 'active'
	},
	{
		label: 'Block Height',
		value: '2,847,392',
		status: 'active'
	},
	{
		label: 'Confirmation Time',
		value: '~10 minutes',
		status: 'active'
	},
	{
		label: 'Contract Version',
		value: 'Clarity v3',
		status: 'active'
	}
];

export function BlockchainStats() {
	return (
		<div className="space-y-8">
			{/* Main Stats Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => {
					const IconComponent = stat.icon;
					return (
						<Card key={index} className={`${stat.bgColor} border backdrop-blur-sm hover:scale-105 transition-transform duration-300`}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<IconComponent className={`w-8 h-8 ${stat.color}`} />
									{stat.trend && (
										<Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
											<FaArrowUp className="w-3 h-3 mr-1" />
											{stat.trend}
										</Badge>
									)}
								</div>
								<div className="space-y-1">
									<div className="text-2xl font-bold text-white">{stat.value}</div>
									<div className="text-sm font-medium text-gray-300">{stat.title}</div>
									<div className="text-xs text-gray-400">{stat.description}</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Network Status */}
			<Card className="bg-slate-800/50 border-slate-700">
				<CardHeader>
					<CardTitle className="text-xl text-white flex items-center gap-2">
						<FaGlobe className="w-5 h-5 text-blue-400" />
						Network Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
						{networkInfo.map((info, index) => (
							<div key={index} className="space-y-2">
								<div className="text-sm text-gray-400">{info.label}</div>
								<div className="flex items-center gap-2">
									<div className="text-white font-medium">{info.value}</div>
									<div className="flex items-center gap-1">
										<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
										<span className="text-xs text-green-300">Active</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Deployment Metrics */}
			<Card className="bg-slate-800/50 border-slate-700">
				<CardHeader>
					<CardTitle className="text-xl text-white flex items-center gap-2">
						<FaCheckCircle className="w-5 h-5 text-green-400" />
						Deployment Metrics
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="text-center">
							<div className="text-3xl font-bold text-white mb-2">1,580</div>
							<div className="text-sm text-gray-400">Total Lines of Code</div>
							<div className="text-xs text-gray-500 mt-1">Across 4 contracts</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-white mb-2">0.460</div>
							<div className="text-sm text-gray-400">HBAR Total Cost</div>
							<div className="text-xs text-gray-500 mt-1">One-time deployment</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-white mb-2">100%</div>
							<div className="text-sm text-gray-400">SIP Compliance</div>
							<div className="text-xs text-gray-500 mt-1">Industry standards</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Performance Indicators */}
			<div className="grid md:grid-cols-2 gap-6">
				<Card className="bg-slate-800/50 border-slate-700">
					<CardHeader>
						<CardTitle className="text-lg text-white flex items-center gap-2">
							<FaClock className="w-5 h-5 text-blue-400" />
							Performance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-gray-400">Transaction Speed</span>
								<span className="text-white font-medium">~2.5 seconds</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-400">Gas Optimization</span>
								<span className="text-white font-medium">274 μHBAR/line</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-400">Uptime</span>
								<span className="text-white font-medium">99.9%</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-slate-800/50 border-slate-700">
					<CardHeader>
						<CardTitle className="text-lg text-white flex items-center gap-2">
							<FaShieldAlt className="w-5 h-5 text-green-400" />
							Security
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-gray-400">Signature Verification</span>
								<span className="text-white font-medium">secp256k1</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-400">Replay Protection</span>
								<span className="text-white font-medium">✓ Enabled</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-400">Access Control</span>
								<span className="text-white font-medium">Multi-tier</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
