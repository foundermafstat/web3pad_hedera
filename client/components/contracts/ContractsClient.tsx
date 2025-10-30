'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaList, FaBookOpen } from 'react-icons/fa';
import { PageWithFooter } from '@/components/PageWithFooter';
import type { BlockchainStatus } from '@/lib/blockchain';

export type CoreContract = {
	key: string;
	name: string;
	address: string;
	title: string;
	description: string;
	functions: string[];
};

type ContractsClientProps = {
	initialBlockchainStatus: BlockchainStatus | null;
	initialContracts: CoreContract[];
};

export function ContractsClient({
	initialBlockchainStatus,
	initialContracts,
}: ContractsClientProps) {
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState<string>('overview');
	const [blockchainStatus, setBlockchainStatus] =
		useState<BlockchainStatus | null>(initialBlockchainStatus);
	const [loading, setLoading] = useState(false);
	const [selectedContract, setSelectedContract] = useState<CoreContract | null>(
		null
	);
	const [coreContracts, setCoreContracts] = useState<CoreContract[]>(
		initialContracts || []
	);
	const [systemStats, setSystemStats] = useState<null | {
		gamesPlayed: number;
		players: number;
		rewardsDistributed: number;
		poolBalance: number;
		totalParticipants: number;
		initialized: boolean;
	}>(null);
	const [lotteryInfo, setLotteryInfo] = useState<null | {
		poolBalance: number;
		totalParticipants: number;
		lastDrawTimestamp: number;
		drawInterval: number;
		timeUntilNextDraw: number;
		isParticipant?: boolean;
		participantTxCount?: number;
		participantVolume?: number;
		participants?: string[];
	}>(null);
	const [faucetInfo, setFaucetInfo] = useState<null | {
		hbarToHplayRate: number;
		bonusMultiplierMin: number;
		bonusMultiplierMax: number;
		dailyLimitHbar: number;
		faucetEnabled: boolean;
		totalDistributed?: number;
		totalUsers?: number;
		totalSwaps?: number;
		totalHbar?: number;
		user?: {
			dailyUsedHbar: number;
			lastSwapTimestamp: number;
			totalSwaps: number;
			bonusFactor?: number;
			isNewDay?: boolean;
			remainingDaily?: number;
		};
	}>(null);
	const [networkInfo, setNetworkInfo] = useState({
		network: initialBlockchainStatus?.network || 'Testnet',
		deployedContracts: initialContracts.length,
		totalCost: '0.000000',
		status:
			initialContracts.length > 0 || initialBlockchainStatus?.enabled
				? 'Connected'
				: 'Disconnected',
	});

	useEffect(() => {
		// Optional light refresh to ensure latest status without SSR re-render
		const refresh = async () => {
			try {
				const [statusRes, contractsRes] = await Promise.all([
					fetch('/api/blockchain/status', { cache: 'no-store' }),
					fetch('/api/contracts', { cache: 'no-store' }),
				]);
				const statusJson = await statusRes.json();
				const contractsJson = await contractsRes.json();
				const status = statusJson?.data || null;
				const list: CoreContract[] = Array.isArray(contractsJson?.data)
					? contractsJson.data
					: [];
				setBlockchainStatus(status);
				setCoreContracts(list);
				setNetworkInfo((prev) => ({
					...prev,
					network: status?.network || prev.network,
					deployedContracts: list.length,
					status:
						list.length > 0 || status?.enabled ? 'Connected' : 'Disconnected',
				}));
			} catch (_) {}
		};
		refresh();
	}, []);

	// Fetch HederaGameLaunchpad system stats when its tab becomes active
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const base =
					process.env.NEXT_PUBLIC_SERVER_BASE_URL || 'http://localhost:3001';
				const res = await fetch(`${base}/api/contracts/system/stats`, {
					cache: 'no-store',
				});
				const json = await res.json();
				if (json?.success && json?.data) {
					setSystemStats(json.data);
				}
			} catch (_) {
				// ignore
			}
		};

		if (activeTab === 'HederaGameLaunchpad') {
			fetchStats();
		}
	}, [activeTab]);

	// Fetch FaucetManager info when its tab becomes active
	useEffect(() => {
		const fetchFaucet = async () => {
			try {
				const base =
					process.env.NEXT_PUBLIC_SERVER_BASE_URL || 'http://localhost:3001';
				const [rateRes, statsRes] = await Promise.all([
					fetch(`${base}/api/contracts/faucet/rpc/swap-rate`, {
						cache: 'no-store',
					}),
					fetch(`${base}/api/contracts/faucet/rpc/stats`, {
						cache: 'no-store',
					}),
				]);
				const [rateJson, statsJson] = await Promise.all([
					rateRes.json(),
					statsRes.json(),
				]);
				const addr = getPlayerAddress();
				let userBlock: any = undefined;
				if (addr) {
					const [userRes, bonusRes, remainRes] = await Promise.all([
						fetch(`${base}/api/contracts/faucet/rpc/user/${addr}`, {
							cache: 'no-store',
						}),
						fetch(`${base}/api/contracts/faucet/rpc/bonus-factor/${addr}`, {
							cache: 'no-store',
						}),
						fetch(`${base}/api/contracts/faucet/rpc/remaining-daily/${addr}`, {
							cache: 'no-store',
						}),
					]);
					const [userJson, bonusJson, remainJson] = await Promise.all([
						userRes.json(),
						bonusRes.json(),
						remainRes.json(),
					]);
					const isNewDay = await fetch(
						`${base}/api/contracts/faucet/rpc/is-new-day/${
							userJson?.data?.lastSwapTimestamp || 0
						}`,
						{ cache: 'no-store' }
					)
						.then((r) => r.json())
						.catch(() => null);
					userBlock = {
						...(userJson?.data || {}),
						bonusFactor: bonusJson?.data?.bonusFactor ?? undefined,
						remainingDaily: remainJson?.data?.remaining ?? undefined,
						isNewDay: isNewDay?.data?.isNewDay ?? undefined,
					};
				}

				setFaucetInfo({
					...(rateJson?.data || {}),
					...(statsJson?.data || {}),
					user: userBlock,
				});
			} catch (_) {}
		};

		if (activeTab === 'FaucetManager') {
			fetchFaucet();
		}
	}, [activeTab]);

	// Fetch LotteryPool info when its tab becomes active
	useEffect(() => {
		const fetchLottery = async () => {
			try {
				const base =
					process.env.NEXT_PUBLIC_SERVER_BASE_URL || 'http://localhost:3001';
				const [
					poolRes,
					partsRes,
					lastDrawRes,
					intervalRes,
					nextDrawRes,
					allPartsRes,
				] = await Promise.all([
					fetch(`${base}/api/contracts/lottery/pool-balance`, {
						cache: 'no-store',
					}),
					fetch(`${base}/api/contracts/lottery/participants`, {
						cache: 'no-store',
					}),
					fetch(`${base}/api/contracts/lottery/last-draw`, {
						cache: 'no-store',
					}),
					fetch(`${base}/api/contracts/lottery/draw-interval`, {
						cache: 'no-store',
					}),
					fetch(`${base}/api/contracts/lottery/next-draw`, {
						cache: 'no-store',
					}),
					fetch(`${base}/api/contracts/lottery/participants/all`, {
						cache: 'no-store',
					}),
				]);
				const [
					poolJson,
					partsJson,
					lastDrawJson,
					intervalJson,
					nextDrawJson,
					allPartsJson,
				] = await Promise.all([
					poolRes.json(),
					partsRes.json(),
					lastDrawRes.json(),
					intervalRes.json(),
					nextDrawRes.json(),
					allPartsRes.json(),
				]);

				const baseInfo = {
					poolBalance: poolJson?.data?.poolBalance ?? 0,
					totalParticipants: partsJson?.data?.participants ?? 0,
					lastDrawTimestamp: lastDrawJson?.data?.lastDrawTimestamp ?? 0,
					drawInterval: intervalJson?.data?.drawInterval ?? 0,
					timeUntilNextDraw: nextDrawJson?.data?.timeUntilNextDraw ?? 0,
					participants: Array.isArray(allPartsJson?.data?.participants)
						? allPartsJson.data.participants
						: [],
				};

				// Optional per-user info
				const addr = getPlayerAddress();
				if (addr) {
					const [isPartRes, txCountRes, volumeRes] = await Promise.all([
						fetch(`${base}/api/contracts/lottery/is-participant/${addr}`, {
							cache: 'no-store',
						}),
						fetch(
							`${base}/api/contracts/lottery/participant/${addr}/tx-count`,
							{ cache: 'no-store' }
						),
						fetch(`${base}/api/contracts/lottery/participant/${addr}/volume`, {
							cache: 'no-store',
						}),
					]);
					const [isPartJson, txCountJson, volumeJson] = await Promise.all([
						isPartRes.json(),
						txCountRes.json(),
						volumeRes.json(),
					]);
					setLotteryInfo({
						...baseInfo,
						isParticipant: !!isPartJson?.data?.isParticipant,
						participantTxCount: txCountJson?.data?.count ?? 0,
						participantVolume: volumeJson?.data?.volume ?? 0,
					});
				} else {
					setLotteryInfo(baseInfo);
				}
			} catch (_) {
				// ignore
			}
		};

		if (activeTab === 'LotteryPool') {
			fetchLottery();
		}
	}, [activeTab]);

	const handleContractSelect = (contract: CoreContract) => {
		setSelectedContract(contract);
		setActiveTab(contract.key);
	};

	const getPlayerAddress = () => {
		const wallets = (session as any)?.user?.wallets || [];
		const primaryWallet = wallets.find((w: any) => w.isPrimary) || wallets[0];
		return primaryWallet?.address || undefined;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">
						Loading contracts interface...
					</p>
				</div>
			</div>
		);
	}

	return (
		<PageWithFooter>
			<div className="min-h-screen bg-background">
				<div className="bg-card border border-border rounded-md mb-6">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-6 lg:pt-16">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<h1 className="text-2xl font-bold text-foreground">
									Contract Management
								</h1>
								{((blockchainStatus &&
									(blockchainStatus.enabled || coreContracts.length > 0)) ||
									(!blockchainStatus && coreContracts.length > 0)) && (
									<div
										className={`ml-4 px-3 py-1 rounded-full text-xs font-medium border ${'bg-green-500/10 text-green-500 border-green-500/20'}`}
									>
										{'Blockchain Connected'}
									</div>
								)}

								{/* FaucetManager specific data shown in FaucetManager contract tab */}
								{activeTab === 'FaucetManager' && (
									<div className="mt-6">
										<h3 className="text-lg font-semibold text-foreground mb-3">
											Faucet statistics
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.hbarToHplayRate ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													HBAR-&gt;HPLAY rate
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.bonusMultiplierMin ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													Bonus min (x100)
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.bonusMultiplierMax ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													Bonus max (x100)
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.dailyLimitHbar ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													Daily limit (tinyHBAR)
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div
													className={`text-2xl font-bold ${
														faucetInfo?.faucetEnabled
															? 'text-primary'
															: 'text-destructive'
													}`}
												>
													{faucetInfo?.faucetEnabled ? 'Enabled' : 'Disabled'}
												</div>
												<div className="text-xs text-muted-foreground">
													Faucet state
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.totalDistributed ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													Total distributed (HPLAY)
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.totalUsers ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													Total users
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.totalSwaps ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													Total swaps
												</div>
											</div>
											<div className="bg-card border border-border rounded-md p-4">
												<div className="text-2xl font-bold text-primary">
													{faucetInfo?.totalHbar ?? '—'}
												</div>
												<div className="text-xs text-muted-foreground">
													Total HBAR received (tinyHBAR)
												</div>
											</div>
											{faucetInfo?.user && (
												<>
													<div className="bg-card border border-border rounded-md p-4">
														<div className="text-2xl font-bold text-primary">
															{faucetInfo.user.dailyUsedHbar}
														</div>
														<div className="text-xs text-muted-foreground">
															Your daily used (tinyHBAR)
														</div>
													</div>
													<div className="bg-card border border-border rounded-md p-4">
														<div className="text-2xl font-bold text-primary">
															{faucetInfo.user.lastSwapTimestamp}
														</div>
														<div className="text-xs text-muted-foreground">
															Your last swap (unix)
														</div>
													</div>
													<div className="bg-card border border-border rounded-md p-4">
														<div className="text-2xl font-bold text-primary">
															{faucetInfo.user.totalSwaps}
														</div>
														<div className="text-xs text-muted-foreground">
															Your swaps
														</div>
													</div>
													{typeof faucetInfo.user.bonusFactor !==
														'undefined' && (
														<div className="bg-card border border-border rounded-md p-4">
															<div className="text-2xl font-bold text-primary">
																{faucetInfo.user.bonusFactor}
															</div>
															<div className="text-xs text-muted-foreground">
																Your bonus factor (x100)
															</div>
														</div>
													)}
													{typeof faucetInfo.user.remainingDaily !==
														'undefined' && (
														<div className="bg-card border border-border rounded-md p-4">
															<div className="text-2xl font-bold text-primary">
																{faucetInfo.user.remainingDaily}
															</div>
															<div className="text-xs text-muted-foreground">
																Your remaining daily (tinyHBAR)
															</div>
														</div>
													)}
													{typeof faucetInfo.user.isNewDay !== 'undefined' && (
														<div className="bg-card border border-border rounded-md p-4">
															<div
																className={`text-2xl font-bold ${
																	faucetInfo.user.isNewDay
																		? 'text-primary'
																		: 'text-muted-foreground'
																}`}
															>
																{faucetInfo.user.isNewDay
																	? 'New day'
																	: 'Same day'}
															</div>
															<div className="text-xs text-muted-foreground">
																Day status
															</div>
														</div>
													)}
												</>
											)}
										</div>
									</div>
								)}
							</div>
							<div className="flex items-center space-x-4">
								{session && (
									<div className="text-sm text-muted-foreground">
										Connected as:{' '}
										<span className="font-medium text-foreground">
											{(session as any).user?.email}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="bg-card border border-border rounded-md mb-6">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<nav className="flex space-x-8">
							{[
								{
									id: 'overview',
									name: 'Overview',
									icon: <FaList className="w-4 h-4" />,
								},
								...coreContracts.map((c) => ({
									id: c.key,
									name: c.title,
									icon: <FaBookOpen className="w-4 h-4" />,
								})),
							].map((tab: any) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id as any)}
									className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
										activeTab === tab.id
											? 'border-primary text-primary'
											: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
									}`}
								>
									<span
										className={`mr-2 inline-flex items-center justify-center w-6 h-6 rounded-md ${
											activeTab === tab.id
												? 'bg-primary/50 text-primary'
												: 'bg-muted text-muted-foreground'
										}`}
									>
										{tab.icon}
									</span>
									{tab.name}
								</button>
							))}
						</nav>
					</div>
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{coreContracts.length === 0 &&
						blockchainStatus &&
						!blockchainStatus.enabled && (
							<div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
								<div className="flex items-center">
									<svg
										className="w-5 h-5 text-yellow-500 mr-3"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
									<div>
										<h3 className="text-sm font-medium text-yellow-600">
											Blockchain integration disabled
										</h3>
										<p className="text-sm text-yellow-500 mt-1">
											Some features may be unavailable. Check server settings.
										</p>
									</div>
								</div>
							</div>
						)}

					<div className="space-y-6">
						{activeTab === 'overview' && (
							<div className="space-y-6">
								<div className="bg-card border border-border rounded-md p-6">
									<h2 className="text-xl font-bold text-primary mb-4">
										Network Information
									</h2>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-card border border-border rounded-md p-4">
											<div className="text-2xl font-bold text-primary">
												{networkInfo.network}
											</div>
											<div className="text-xs text-muted-foreground">
												Network
											</div>
										</div>
										<div className="bg-card border border-border rounded-md p-4">
											<div className="text-2xl font-bold text-primary">
												{networkInfo.deployedContracts}
											</div>
											<div className="text-xs text-muted-foreground">
												Deployed Contracts
											</div>
										</div>
										<div className="bg-card border border-border rounded-md p-4">
											<div className="text-2xl font-bold text-primary">
												{networkInfo.totalCost}
											</div>
											<div className="text-xs text-muted-foreground">
												Total Cost (HBAR)
											</div>
										</div>
										<div className="bg-card border border-border rounded-md p-4">
											<div
												className={`text-2xl font-bold ${
													networkInfo.status === 'Live' ||
													networkInfo.status === 'Connected'
														? 'text-primary'
														: networkInfo.status === 'Disconnected'
														? 'text-destructive'
														: 'text-warning'
												}`}
											>
												{networkInfo.status}
											</div>
											<div className="text-xs text-muted-foreground">
												All Contracts Status
											</div>
										</div>
									</div>
								</div>

								<div className="bg-card border border-border rounded-md p-6">
									<h2 className="text-xl font-bold text-foreground mb-4">
										Contracts (current addresses)
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
										{coreContracts.map((c) => (
											<button
												key={c.key}
												onClick={() => setActiveTab(c.key)}
												className="text-left border border-border rounded-md p-4 hover:border-primary hover:bg-accent transition-colors"
											>
												<div className="flex items-center justify-between mb-2">
													<h3 className="text-lg font-semibold text-foreground">
														{c.title}
													</h3>
													<span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
														Live
													</span>
												</div>
												<div className="text-xs text-muted-foreground mb-2">
													Address
												</div>
												<div className="font-mono text-sm break-all">
													{c.address}
												</div>
											</button>
										))}
									</div>
								</div>

								{coreContracts.length > 0 && (
									<div className="bg-card border border-border rounded-md p-6">
										<h2 className="text-xl font-bold text-foreground mb-4">
											Core Contracts
										</h2>
										<div className="grid grid-cols-1 md:grid-cols-2 xl-grid-cols-3 gap-4"></div>
									</div>
								)}
							</div>
						)}

						{activeTab !== 'overview' &&
							coreContracts.some((c) => c.key === activeTab) && (
								<div className="bg-card border border-border rounded-md p-6">
									{coreContracts
										.filter((c) => c.key === activeTab)
										.map((c) => (
											<div key={c.key} className="space-y-4">
												<h2 className="text-xl font-bold text-foreground">
													{c.title}
												</h2>
												<div>
													<div className="text-xs text-muted-foreground mb-1">
														Address
													</div>
													<div className="font-mono text-sm break-all">
														{c.address}
													</div>
												</div>
												<div>
													<div className="text-xs text-muted-foreground mb-1">
														Description
													</div>
													<p className="text-sm text-foreground">
														{c.description}
													</p>
												</div>
												<div>
													<div className="text-xs text-muted-foreground mb-2">
														Functions
													</div>
													<ul className="list-disc list-inside space-y-1 text-sm text-foreground">
														{c.functions.map((f, idx) => (
															<li key={`${c.key}-fn-detail-${idx}`}>{f}</li>
														))}
													</ul>
												</div>
											</div>
										))}

									{/* HederaGameLaunchpad specific data */}
									{activeTab === 'HederaGameLaunchpad' && (
										<div className="mt-6">
											<h3 className="text-lg font-semibold text-foreground mb-3">
												System Statistics
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{systemStats?.gamesPlayed ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Games played
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{systemStats?.players ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Players
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{systemStats?.rewardsDistributed ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Rewards distributed (HPLAY)
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{systemStats?.poolBalance ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Pool balance (HPLAY)
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{systemStats?.totalParticipants ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Lottery participants
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div
														className={`text-2xl font-bold ${
															systemStats?.initialized
																? 'text-primary'
																: 'text-destructive'
														}`}
													>
														{systemStats?.initialized
															? 'Initialized'
															: 'Not initialized'}
													</div>
													<div className="text-xs text-muted-foreground">
														Status
													</div>
												</div>
											</div>
										</div>
									)}

									{/* LotteryPool specific data */}
									{activeTab === 'LotteryPool' && (
										<div className="mt-6">
											<h3 className="text-lg font-semibold text-foreground mb-3">
												Lottery statistics
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{lotteryInfo?.poolBalance ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Pool balance (HPLAY)
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{lotteryInfo?.totalParticipants ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Participants
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{lotteryInfo?.timeUntilNextDraw ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Time until next draw (s)
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{lotteryInfo?.lastDrawTimestamp ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Last draw (unix)
													</div>
												</div>
												<div className="bg-card border border-border rounded-md p-4">
													<div className="text-2xl font-bold text-primary">
														{lotteryInfo?.drawInterval ?? '—'}
													</div>
													<div className="text-xs text-muted-foreground">
														Draw interval (s)
													</div>
												</div>
												{typeof lotteryInfo?.isParticipant !== 'undefined' && (
													<div className="bg-card border border-border rounded-md p-4">
														<div
															className={`text-2xl font-bold ${
																lotteryInfo?.isParticipant
																	? 'text-primary'
																	: 'text-destructive'
															}`}
														>
															{lotteryInfo?.isParticipant
																? 'You participate'
																: 'You do not participate'}
														</div>
														<div className="text-xs text-muted-foreground">
															Your status
														</div>
													</div>
												)}

												{/* FaucetManager specific data moved below to avoid nesting */}
												{typeof lotteryInfo?.participantTxCount !==
													'undefined' && (
													<div className="bg-card border border-border rounded-md p-4">
														<div className="text-2xl font-bold text-primary">
															{lotteryInfo?.participantTxCount}
														</div>
														<div className="text-xs text-muted-foreground">
															Your tx count
														</div>
													</div>
												)}
												{typeof lotteryInfo?.participantVolume !==
													'undefined' && (
													<div className="bg-card border border-border rounded-md p-4">
														<div className="text-2xl font-bold text-primary">
															{lotteryInfo?.participantVolume}
														</div>
														<div className="text-xs text-muted-foreground">
															Your volume (HPLAY)
														</div>
													</div>
												)}
												{/* Participants list (optional) */}
												<div className="bg-card border border-border rounded-md p-4 md:col-span-3">
													<div className="text-sm font-semibold text-foreground mb-2">
														Participants list
													</div>
													{Array.isArray(lotteryInfo?.participants) &&
													lotteryInfo?.participants.length > 0 ? (
														<div className="text-xs text-muted-foreground space-y-1 max-h-48 overflow-auto">
															{lotteryInfo.participants
																.slice(0, 100)
																.map((addr, i) => (
																	<div
																		key={`lp-participant-${i}`}
																		className="font-mono break-all"
																	>
																		{addr}
																	</div>
																))}
															{lotteryInfo.participants.length > 100 && (
																<div className="text-[10px] text-muted-foreground">
																	Showing first 100 entries…
																</div>
															)}
														</div>
													) : (
														<div className="text-xs text-muted-foreground">
															No participants available
														</div>
													)}
												</div>
											</div>
										</div>
									)}
								</div>
							)}

						{selectedContract && (
							<div className="fixed bottom-4 right-4 bg-card rounded-lg shadow-lg border border-border p-4 max-w-sm">
								<div className="flex items-center justify-between mb-2">
									<h4 className="font-semibold text-foreground">
										{selectedContract.name}
									</h4>
									<button
										onClick={() => setSelectedContract(null)}
										className="text-muted-foreground hover:text-foreground"
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
								<p className="text-sm text-muted-foreground mb-2">
									{selectedContract.description}
								</p>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Address:</span>
									<span className="font-mono text-foreground">
										{selectedContract.address}
									</span>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Type:</span>
									<span className="text-foreground">Core</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</PageWithFooter>
	);
}
