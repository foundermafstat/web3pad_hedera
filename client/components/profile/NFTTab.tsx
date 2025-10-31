'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sparkles, Calendar, Award } from 'lucide-react';
import Image from 'next/image';

interface NFT {
	tokenId: number;
	owner: string;
	achievementType: string;
	metadataURI: string;
	mintedTimestamp: number;
	rarityScore: number;
}

interface NFTTabProps {
	userAddress: string;
}

const getRarityColor = (rarity: string) => {
	switch (rarity.toLowerCase()) {
		case 'legendary':
			return 'bg-gradient-to-r from-yellow-500 to-orange-500';
		case 'epic':
			return 'bg-gradient-to-r from-purple-500 to-pink-500';
		case 'rare':
			return 'bg-gradient-to-r from-blue-500 to-cyan-500';
		case 'common':
		default:
			return 'bg-gradient-to-r from-gray-500 to-gray-600';
	}
};

const getRarityLabel = (rarity: string) => {
	switch (rarity.toLowerCase()) {
		case 'legendary':
			return 'Legendary';
		case 'epic':
			return 'Epic';
		case 'rare':
			return 'Rare';
		case 'common':
		default:
			return 'Common';
	}
};

export function NFTTab({ userAddress }: NFTTabProps) {
	const [nfts, setNfts] = useState<NFT[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchNFTs = async () => {
			try {
				setLoading(true);
				setError(null);

				console.log('[NFTTab] Fetching NFTs for address:', userAddress);

				// Encode address for URL
				const encodedAddress = encodeURIComponent(userAddress);
				const url = `/api/contracts/player-nfts?address=${encodedAddress}`;
				
				console.log('[NFTTab] Fetching from:', url);

				const response = await fetch(url);
				const result = await response.json();

				console.log('[NFTTab] NFTs response:', result);

				if (!result.success) {
					throw new Error(result.error || 'Failed to fetch NFTs');
				}

				setNfts(result.data);
			} catch (err) {
				console.error('[NFTTab] Error fetching NFTs:', err);
				setError(err instanceof Error ? err.message : 'Failed to load NFTs');
			} finally {
				setLoading(false);
			}
		};

		if (userAddress) {
			fetchNFTs();
		}
	}, [userAddress]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading NFTs from the blockchain...</p>
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

	if (nfts.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Achievement NFTs</CardTitle>
					<CardDescription>A collection of unique NFTs earned for in-game milestones</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Award className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
						<p className="text-lg font-medium mb-2">No NFTs found</p>
						<p className="text-sm text-muted-foreground">
							This player has not earned any achievement NFTs yet.
							NFTs are issued for special milestones inside the games.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5" />
						NFT collection ({nfts.length})
					</CardTitle>
					<CardDescription>
						Unique achievement tokens minted by the NFTManager smart contract
					</CardDescription>
				</CardHeader>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{nfts.map((nft) => {
					const mintDate = new Date(nft.mintedTimestamp * 1000).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					});

					return (
						<Card key={nft.tokenId} className="overflow-hidden">
							<div className={`h-2 ${getRarityColor(nft.achievementType)}`} />
							
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between mb-2">
									<Badge variant="outline" className="text-xs">
										#{nft.tokenId}
									</Badge>
									<Badge 
										className={`text-xs text-white ${getRarityColor(nft.achievementType)}`}
									>
										{getRarityLabel(nft.achievementType)}
									</Badge>
								</div>
								<CardTitle className="text-lg">
									Achievement NFT
								</CardTitle>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* NFT Image Placeholder */}
								<div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
									<Award className="h-16 w-16 text-primary/40" />
								</div>

								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Sparkles className="h-4 w-4" />
										<span>Rarity score: {nft.rarityScore}</span>
									</div>
									
									<div className="flex items-center gap-2 text-muted-foreground">
										<Calendar className="h-4 w-4" />
										<span>{mintDate}</span>
									</div>

									{nft.metadataURI && (
										<div className="pt-2 border-t">
											<a 
												href={nft.metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/')}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-primary hover:underline"
											>
												View metadata →
											</a>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<Card>
				<CardContent className="pt-6">
					<p className="text-xs text-muted-foreground text-center">
						Data synchronized with the Hedera blockchain via Mirror Node API
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

