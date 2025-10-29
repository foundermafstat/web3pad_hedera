import { ContractErrorHandler } from '../lib/contract-error-handler.js';

/**
 * Middleware for handling contract-related errors
 */
export const contractErrorMiddleware = (error, req, res, next) => {
    console.error('[CONTRACT_MIDDLEWARE] Error:', error);

    // Check if it's a contract-related error
    if (error.type && error.type.startsWith('CONTRACT_')) {
        return res.status(400).json({
            success: false,
            error: error.userMessage || 'Contract operation failed',
            type: error.type,
            timestamp: error.timestamp
        });
    }

    // Handle validation errors
    if (error.message.includes('Invalid address') || 
        error.message.includes('Invalid gameId') || 
        error.message.includes('Invalid score')) {
        return res.status(400).json({
            success: false,
            error: error.message,
            type: 'VALIDATION_ERROR'
        });
    }

    // Handle Hedera-specific errors
    if (error.message.includes('Hedera') || error.message.includes('Contract')) {
        return res.status(500).json({
            success: false,
            error: 'Blockchain service temporarily unavailable',
            type: 'BLOCKCHAIN_ERROR'
        });
    }

    // Default error handling
    next(error);
};

/**
 * Middleware for validating contract request parameters
 */
export const validateContractParams = (req, res, next) => {
    const { address } = req.params;
    const { gameId, score } = req.body;

    try {
        // Validate address parameter
        if (address) {
            ContractErrorHandler.validateAddress(address);
        }

        // Validate gameId in body
        if (gameId) {
            ContractErrorHandler.validateGameId(gameId);
        }

        // Validate score in body
        if (score !== undefined) {
            ContractErrorHandler.validateScore(score);
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
            type: 'VALIDATION_ERROR'
        });
    }
};

/**
 * Middleware for logging contract API calls
 */
export const logContractCalls = (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data) {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            userAgent: req.get('User-Agent'),
            ip: req.ip
        };

        if (res.statusCode >= 400) {
            console.error('[CONTRACT_API] Error Response:', logData);
        } else {
            console.log('[CONTRACT_API] Success Response:', logData);
        }

        originalSend.call(this, data);
    };

    next();
};

/**
 * Rate limiting middleware for contract calls
 */
const rateLimitMap = new Map();

export const contractRateLimit = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        if (rateLimitMap.has(clientId)) {
            const requests = rateLimitMap.get(clientId).filter(time => time > windowStart);
            rateLimitMap.set(clientId, requests);
        } else {
            rateLimitMap.set(clientId, []);
        }

        const requests = rateLimitMap.get(clientId);

        if (requests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                type: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
            });
        }

        requests.push(now);
        next();
    };
};
