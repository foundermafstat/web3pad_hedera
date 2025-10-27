import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;
	
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ 
			error: 'Unauthorized',
			message: 'No token provided' 
		});
	}

	const token = authHeader.substring(7);

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		console.error('[Auth Middleware] Token verification failed:', error.message);
		return res.status(401).json({ 
			error: 'Unauthorized',
			message: 'Invalid or expired token' 
		});
	}
}

/**
 * Optional auth middleware - attaches user if token is valid, but doesn't block
 */
export function optionalAuthMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;
	
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		req.user = null;
		return next();
	}

	const token = authHeader.substring(7);

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
	} catch (error) {
		req.user = null;
	}
	
	next();
}

/**
 * Socket.io auth middleware
 */
export function socketAuthMiddleware(socket, next) {
	const token = socket.handshake.auth.token || socket.handshake.query.token;
	
	if (!token) {
		// Allow connection but mark as guest
		socket.user = { isGuest: true };
		return next();
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		socket.user = decoded;
		socket.user.isGuest = false;
		console.log(`[Socket Auth] User ${decoded.userId} connected`);
		next();
	} catch (error) {
		console.error('[Socket Auth] Token verification failed:', error.message);
		socket.user = { isGuest: true };
		next();
	}
}

/**
 * Get user from database by ID
 */
export async function getUserFromRequest(req) {
	if (!req.user || !req.user.userId) {
		return null;
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.userId },
			select: {
				id: true,
				email: true,
				username: true,
				displayName: true,
				avatar: true,
				blockchainConnected: true,
				level: true,
				experience: true,
				coins: true,
				wallets: {
					select: {
						address: true,
						type: true,
						network: true,
						isPrimary: true,
					},
				},
			},
		});

		return user;
	} catch (error) {
		console.error('[Auth] Error fetching user:', error);
		return null;
	}
}

/**
 * Require specific user role (for future use)
 */
export function requireRole(...roles) {
	return async (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const user = await getUserFromRequest(req);
		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		// For now, all authenticated users have access
		// In future: check user.role against roles array
		next();
	};
}

export default authMiddleware;

