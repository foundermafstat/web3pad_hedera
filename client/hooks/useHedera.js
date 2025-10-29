import { useState, useEffect, useCallback } from 'react';
import { hederaClient } from '../lib/hedera-client';

/**
 * React hook for Hedera contract data
 * @param {string} address Player address
 * @returns {Object} Contract data and loading states
 */
export function useHederaPlayer(address) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlayerData = useCallback(async () => {
        if (!address) return;

        setLoading(true);
        setError(null);

        try {
            const playerSummary = await hederaClient.getPlayerSummary(address);
            setData(playerSummary);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch player data:', err);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchPlayerData();
    }, [fetchPlayerData]);

    return {
        data,
        loading,
        error,
        refetch: fetchPlayerData
    };
}

/**
 * React hook for system statistics
 * @returns {Object} System data and loading states
 */
export function useHederaSystem() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSystemData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const systemOverview = await hederaClient.getSystemOverview();
            setData(systemOverview);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch system data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSystemData();
    }, [fetchSystemData]);

    return {
        data,
        loading,
        error,
        refetch: fetchSystemData
    };
}

/**
 * React hook for token balance
 * @param {string} address Wallet address
 * @returns {Object} Balance data and loading states
 */
export function useTokenBalance(address) {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBalance = useCallback(async () => {
        if (!address) return;

        setLoading(true);
        setError(null);

        try {
            const tokenBalance = await hederaClient.getTokenBalance(address);
            setBalance(tokenBalance);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch token balance:', err);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance,
        loading,
        error,
        refetch: fetchBalance
    };
}

/**
 * React hook for lottery information
 * @returns {Object} Lottery data and loading states
 */
export function useLotteryInfo() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLotteryData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [poolBalance, participants, timeUntilNextDraw] = await Promise.all([
                hederaClient.getLotteryPoolBalance(),
                hederaClient.getLotteryParticipants(),
                hederaClient.getTimeUntilNextDraw()
            ]);

            setData({
                poolBalance,
                participants,
                timeUntilNextDraw,
                lastUpdated: new Date().toISOString()
            });
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch lottery data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLotteryData();
    }, [fetchLotteryData]);

    return {
        data,
        loading,
        error,
        refetch: fetchLotteryData
    };
}

/**
 * React hook for game information
 * @param {string} gameId Game identifier
 * @returns {Object} Game data and loading states
 */
export function useGameInfo(gameId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGameData = useCallback(async () => {
        if (!gameId) return;

        setLoading(true);
        setError(null);

        try {
            const [gameInfo, difficulty] = await Promise.all([
                hederaClient.getGameInfo(gameId),
                hederaClient.getGameDifficulty(gameId)
            ]);

            setData({
                ...gameInfo,
                difficulty,
                lastUpdated: new Date().toISOString()
            });
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch game data:', err);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        fetchGameData();
    }, [fetchGameData]);

    return {
        data,
        loading,
        error,
        refetch: fetchGameData
    };
}

/**
 * React hook for calculating rewards
 * @param {number} score Game score
 * @param {string} gameId Game identifier
 * @returns {Object} Reward data and loading states
 */
export function useRewardCalculation(score, gameId) {
    const [reward, setReward] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateReward = useCallback(async () => {
        if (!score || !gameId) return;

        setLoading(true);
        setError(null);

        try {
            const rewardAmount = await hederaClient.calculateReward(score, gameId);
            setReward(rewardAmount);
        } catch (err) {
            setError(err.message);
            console.error('Failed to calculate reward:', err);
        } finally {
            setLoading(false);
        }
    }, [score, gameId]);

    useEffect(() => {
        calculateReward();
    }, [calculateReward]);

    return {
        reward,
        loading,
        error,
        recalculate: calculateReward
    };
}

/**
 * React hook for faucet information
 * @param {string} address User address
 * @returns {Object} Faucet data and loading states
 */
export function useFaucetInfo(address) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFaucetData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [swapRate, userSwapInfo] = await Promise.all([
                hederaClient.getSwapRate(),
                address ? hederaClient.getUserSwapInfo(address) : null
            ]);

            setData({
                swapRate,
                userSwapInfo,
                lastUpdated: new Date().toISOString()
            });
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch faucet data:', err);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchFaucetData();
    }, [fetchFaucetData]);

    return {
        data,
        loading,
        error,
        refetch: fetchFaucetData
    };
}
