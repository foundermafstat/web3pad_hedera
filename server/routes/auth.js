import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import {
	createUser,
	findUserByEmail,
	findUserByUsername,
	verifyPassword,
} from '../lib/db-helpers.js';

const router = express.Router();

// JWT secret from environment or default (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Register new user
router.post('/register', async (req, res) => {
	try {
		const { email, password, username, displayName } = req.body;

		// Validation
		if (!email || !password || !username || !displayName) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: 'Password must be at least 6 characters' });
		}

		if (username.length < 3) {
			return res.status(400).json({ error: 'Username must be at least 3 characters' });
		}

		// Check if email already exists
		const existingEmail = await findUserByEmail(email);
		if (existingEmail) {
			return res.status(400).json({ error: 'Email already registered' });
		}

		// Check if username already exists
		const existingUsername = await findUserByUsername(username);
		if (existingUsername) {
			return res.status(400).json({ error: 'Username already taken' });
		}

		// Create user
		const user = await createUser({
			email,
			password,
			username,
			displayName,
		});

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			JWT_SECRET,
			{ expiresIn: '30d' }
		);

		console.log(`[Auth] User registered: ${username} (${email})`);

		res.status(201).json({
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
			token,
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Login user
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: 'Missing email or password' });
		}

		// Find user by email
		const user = await findUserByEmail(email);
		if (!user) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		// Verify password
		const isValid = await verifyPassword(password, user.password);
		if (!isValid) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			JWT_SECRET,
			{ expiresIn: '30d' }
		);

		console.log(`[Auth] User logged in: ${user.username}`);

		res.json({
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
			avatar: user.avatar,
			level: user.level,
			experience: user.experience,
			coins: user.coins,
			token,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// OAuth registration/login
router.post('/oauth', async (req, res) => {
	try {
		const { provider, providerId, email, name, image } = req.body;
		
		console.log(`[Auth] OAuth request received:`, { 
			provider, 
			providerId, 
			email, 
			name, 
			hasImage: !!image,
			headers: req.headers['user-agent'],
			ip: req.ip || req.socket.remoteAddress
		});

		if (!provider || !providerId) {
			console.log('[Auth] OAuth error: Missing provider or providerId');
			return res.status(400).json({ error: 'Missing provider information' });
		}
		
		if (!email) {
			console.log('[Auth] OAuth error: Missing email field');
			return res.status(400).json({ error: 'Email address is required. Please ensure your GitHub account has a public email or check account settings.' });
		}

		// Check if user exists by email
		let user = await findUserByEmail(email);

		if (!user) {
			// Create new user from OAuth
			const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(7);
			
			console.log(`[Auth] Creating new user from OAuth: ${username} (${email})`);
			
			try {
				user = await prisma.user.create({
					data: {
						email,
						username,
						displayName: name || username,
						password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
						avatar: image,
					},
				});
				
				console.log(`[Auth] OAuth user created successfully: ${username} (id: ${user.id})`);
			} catch (createError) {
				console.error('[Auth] Error creating OAuth user:', createError);
				return res.status(500).json({ error: 'Failed to create user account' });
			}
		} else {
			// Always update avatar and displayName if provided (OAuth data may change)
			const updateData = {};
			
			if (image) {
				updateData.avatar = image;
			}
			
			if (name && name !== user.displayName) {
				updateData.displayName = name;
			}
			
			// Update user if there are changes
			if (Object.keys(updateData).length > 0) {
				console.log(`[Auth] Updating existing OAuth user: ${user.username} (id: ${user.id})`, updateData);
				
				try {
					user = await prisma.user.update({
						where: { id: user.id },
						data: updateData,
					});
					console.log(`[Auth] OAuth user updated: ${user.username}`);
				} catch (updateError) {
					console.error('[Auth] Error updating OAuth user:', updateError);
					// Continue with existing user data if update fails
				}
			} else {
				console.log(`[Auth] OAuth user logged in: ${user.username} (${provider}) - no updates needed`);
			}
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			JWT_SECRET,
			{ expiresIn: '30d' }
		);

		res.json({
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
			avatar: user.avatar,
			level: user.level,
			experience: user.experience,
			coins: user.coins,
			token,
		});
	} catch (error) {
		console.error('OAuth error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Verify token (for middleware)
export function verifyToken(req, res, next) {
	const authHeader = req.headers.authorization;
	
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'No token provided' });
	}

	const token = authHeader.substring(7);

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

// Get current user (protected route)
router.get('/me', verifyToken, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.userId },
			select: {
				id: true,
				email: true,
				username: true,
				displayName: true,
				avatar: true,
				level: true,
				experience: true,
				coins: true,
				createdAt: true,
			},
		});

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;