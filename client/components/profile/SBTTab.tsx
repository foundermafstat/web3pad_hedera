'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, TrendingUp, Target, Calendar, Zap } from 'lucide-react';

interface PlayerStats {
	totalGamesPlayed: number;
	totalWins: number;
	totalPoints: number;
	totalLosses: number;
	averageScore: number;
	lastGameTimestamp: number;
}

interface SBTData {
	hasSBT: boolean;
	tokenId?: number;
	stats?: PlayerStats;
}

interface SBTTabProps {
	userAddress: string;
}

export function SBTTab({ userAddress }: SBTTabProps) {
	const [sbtData, setSbtData] = useState<SBTData | null>(null);
	const [stats, setStats] = useState<PlayerStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				console.log('[SBTTab] Fetching data for address:', userAddress);

				// Encode address for URL
				const encodedAddress = encodeURIComponent(userAddress);

				// Fetch SBT token info
				const sbtUrl = `/api/contracts/player-sbt-token?address=${encodedAddress}`;
				console.log('[SBTTab] Fetching from:', sbtUrl);
				
				const sbtResponse = await fetch(sbtUrl);
				const sbtResult = await sbtResponse.json();

				console.log('[SBTTab] SBT response:', sbtResult);

				if (!sbtResult.success) {
					throw new Error(sbtResult.error || 'Failed to fetch SBT data');
				}

				setSbtData(sbtResult.data);

				// If user has SBT, fetch blockchain stats
				if (sbtResult.data.hasSBT) {
					const statsUrl = `/api/contracts/blockchain-stats?address=${encodedAddress}`;
					console.log('[SBTTab] Fetching stats from:', statsUrl);
					
					const statsResponse = await fetch(statsUrl);
					const statsResult = await statsResponse.json();

					console.log('[SBTTab] Stats response:', statsResult);

					if (statsResult.success) {
						setStats(statsResult.data.overall);
					}
				}
			} catch (err) {
				console.error('[SBTTab] Error fetching SBT data:', err);
				setError(err instanceof Error ? err.message : 'Failed to load SBT data');
			} finally {
				setLoading(false);
			}
		};

		if (userAddress) {
			fetchData();
		}
	}, [userAddress]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading SBT data from the blockchain...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center text-destructive">
						<p>Error: {error}</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!sbtData?.hasSBT) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>SBT Token</CardTitle>
					<CardDescription>Soul Bound Token — a unique non-transferable player token</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
						<p className="text-lg font-medium mb-2">SBT token not found</p>
						<p className="text-sm text-muted-foreground">
							This player has not received an SBT token yet. It is minted after the first game.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const winRate = stats && stats.totalGamesPlayed > 0 
		? ((stats.totalWins / stats.totalGamesPlayed) * 100).toFixed(1) 
		: '0';

	const lastGameDate = stats?.lastGameTimestamp 
		? new Date(stats.lastGameTimestamp * 1000).toLocaleDateString('en-US')
		: 'Never';

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						SBT Token #{sbtData.tokenId}
					</CardTitle>
					<CardDescription>
						Soul Bound Token — non-transferable and permanently linked to the player
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-sm">
							ID: {sbtData.tokenId}
						</Badge>
						<Badge variant="secondary" className="text-sm">
							Active
						</Badge>
					</div>
				</CardContent>
			</Card>

			{stats && (
				<>
					<Card>
						<CardHeader>
							<CardTitle>Global blockchain statistics</CardTitle>
							<CardDescription>Data pulled directly from the PlayerSBT smart contract</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Target className="h-4 w-4" />
										<span className="text-sm">Total games</span>
									</div>
									<p className="text-2xl font-bold">{stats.totalGamesPlayed}</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Trophy className="h-4 w-4" />
										<span className="text-sm">Wins</span>
									</div>
									<p className="text-2xl font-bold text-green-600 dark:text-green-400">
										{stats.totalWins}
									</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-muted-foreground">
										<TrendingUp className="h-4 w-4" />
										<span className="text-sm">Win rate</span>
									</div>
									<p className="text-2xl font-bold">{winRate}%</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Zap className="h-4 w-4" />
										<span className="text-sm">Total points</span>
									</div>
									<p className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Target className="h-4 w-4" />
										<span className="text-sm">Average score</span>
									</div>
									<p className="text-2xl font-bold">{stats.averageScore}</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Calendar className="h-4 w-4" />
										<span className="text-sm">Last game</span>
									</div>
									<p className="text-sm font-medium">{lastGameDate}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Detailed breakdown</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-muted-foreground">Losses</span>
									<span className="font-semibold text-red-600 dark:text-red-400">
										{stats.totalLosses}
									</span>
								</div>
								
								<div className="flex justify-between items-center">
									<span className="text-muted-foreground">Win/loss ratio</span>
									<span className="font-semibold">
										{stats.totalLosses > 0 
											? (stats.totalWins / stats.totalLosses).toFixed(2) 
											: stats.totalWins}
									</span>
								</div>

								<div className="pt-4 border-t">
									<p className="text-xs text-muted-foreground">
										Data synchronized with the Hedera blockchain via Mirror Node API
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

