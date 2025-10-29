'use client';

import React from 'react';
import { useHederaPlayer, useHederaSystem, useTokenBalance, useLotteryInfo } from '../hooks/useHedera';

/**
 * Player Stats Component
 * Displays comprehensive player information from Hedera contracts
 */
export function PlayerStatsCard({ address }) {
    const { data, loading, error, refetch } = useHederaPlayer(address);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Error Loading Player Data</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                    onClick={refetch}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-600">No player data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Player Statistics</h3>
                <button
                    onClick={refetch}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">SBT Status</p>
                    <p className="text-lg font-bold text-blue-800">
                        {data.hasSBT ? '✅ Active' : '❌ None'}
                    </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Games Played</p>
                    <p className="text-lg font-bold text-green-800">
                        {data.stats?.totalGamesPlayed || 0}
                    </p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Total Wins</p>
                    <p className="text-lg font-bold text-purple-800">
                        {data.stats?.totalWins || 0}
                    </p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Total Points</p>
                    <p className="text-lg font-bold text-orange-800">
                        {data.stats?.totalPoints?.toLocaleString() || 0}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">NFT Count</p>
                    <p className="text-lg font-bold text-gray-800">{data.nftCount || 0}</p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">HPLAY Balance</p>
                    <p className="text-lg font-bold text-yellow-800">
                        {data.tokenBalance?.toLocaleString() || 0}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    Last updated: {new Date(data.lastUpdated).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

/**
 * System Overview Component
 * Displays system-wide statistics
 */
export function SystemOverviewCard() {
    const { data, loading, error, refetch } = useHederaSystem();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Error Loading System Data</h3>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">System Overview</h3>
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${data.isOperational ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                        {data.isOperational ? 'Operational' : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Players</p>
                    <p className="text-xl font-bold text-blue-800">{data.players || 0}</p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Games Played</p>
                    <p className="text-xl font-bold text-green-800">{data.gamesPlayed || 0}</p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Rewards Distributed</p>
                    <p className="text-xl font-bold text-purple-800">
                        {(data.rewardsDistributed || 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Total Supply</p>
                    <p className="text-xl font-bold text-orange-800">
                        {(data.totalSupply || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Lottery Pool Balance</p>
                <p className="text-lg font-bold text-gray-800">
                    {(data.poolBalance || 0).toLocaleString()} HPLAY
                </p>
            </div>
        </div>
    );
}

/**
 * Token Balance Component
 * Displays token balance for a specific address
 */
export function TokenBalanceCard({ address }) {
    const { balance, loading, error, refetch } = useTokenBalance(address);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Error Loading Balance</h3>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Token Balance</h3>
                <button
                    onClick={refetch}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-2">HPLAY Tokens</p>
                <p className="text-3xl font-bold text-gray-800">
                    {balance?.toLocaleString() || 0}
                </p>
            </div>

            {address && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 break-all">
                        Address: {address}
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Lottery Info Component
 * Displays lottery pool information
 */
export function LotteryInfoCard() {
    const { data, loading, error, refetch } = useLotteryInfo();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Error Loading Lottery Data</h3>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    const formatTime = (seconds) => {
        if (seconds === 0) return 'Draw in progress';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Lottery Pool</h3>
                <button
                    onClick={refetch}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Refresh
                </button>
            </div>

            <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium mb-2">Pool Balance</p>
                    <p className="text-2xl font-bold text-orange-800">
                        {data.poolBalance?.toLocaleString() || 0} HPLAY
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Participants</p>
                        <p className="text-lg font-bold text-blue-800">
                            {data.participants || 0}
                        </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Next Draw</p>
                        <p className="text-lg font-bold text-green-800">
                            {formatTime(data.timeUntilNextDraw || 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
