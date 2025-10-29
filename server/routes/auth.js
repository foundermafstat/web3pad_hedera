import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Check required fields
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be filled'
      });
    }

    // Check if email or username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: displayName || username,
      }
    });

    // Don't include password in response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Don't include password in response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// OAuth authentication (Google, GitHub, etc.)
router.post('/oauth', async (req, res) => {
  try {
    const { provider, providerId, email, name, image } = req.body;

    if (!provider || !providerId || !email) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be filled'
      });
    }

    // Check existing user by email
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create unique username based on email
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Check if username is taken
      while (true) {
        const existingUser = await prisma.user.findUnique({
          where: { username }
        });

        if (!existingUser) break;
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          username,
          displayName: name || username,
          avatar: image,
          oauthProviders: {
            create: {
              provider,
              providerId,
            }
          }
        }
      });
    } else {
      // Check existing OAuth provider
      const existingOAuthProvider = await prisma.oauthProvider.findFirst({
        where: {
          userId: user.id,
          provider,
        }
      });

      if (!existingOAuthProvider) {
        // Add new OAuth provider
        await prisma.oauthProvider.create({
          data: {
            provider,
            providerId,
            userId: user.id
          }
        });
      } else if (existingOAuthProvider.providerId !== providerId) {
        // Update providerId if it changed
        await prisma.oauthProvider.update({
          where: {
            id: existingOAuthProvider.id
          },
          data: {
            providerId
          }
        });
      }

      // Update user data
      user = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          avatar: image || user.avatar,
          displayName: name || user.displayName
        }
      });
    }

    // Don't include password in response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('OAuth authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during OAuth authentication'
    });
  }
});

// Authentication via Blockchain (Leather wallet)
// This endpoint handles wallet connection and authentication as a single login flow
router.post('/leather', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be filled'
      });
    }

    // TODO: Signature verification

    console.log(`[Leather Auth] 🚀 Wallet login initiated for ${walletAddress}`);

    // Find user by wallet address
    let user = await prisma.user.findFirst({
      where: {
        wallets: {
          some: {
            address: walletAddress
          }
        }
      }
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user with wallet connection
      const username = `user_${walletAddress.substring(0, 8)}`;
      const displayName = `User ${walletAddress.substring(0, 8)}`;

      user = await prisma.user.create({
        data: {
          username,
          displayName,
          blockchainConnected: true, // Mark as connected via wallet
          wallets: {
            create: {
              address: walletAddress,
              type: 'evm',
              isPrimary: true
            }
          }
        }
      });

      console.log(`[Leather Auth] ✅ New user created and logged in via wallet: ${username}`);
    } else {
      // Update user to mark wallet login
      user = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          blockchainConnected: true, // Ensure flag is set for wallet login
          updatedAt: new Date() // Update timestamp to track last login
        }
      });

      console.log(`[Leather Auth] ✅ User logged in via wallet connection: ${user.username}`);
    }

    // Don't include password in response
    const { password: _, ...userWithoutPassword } = user;

    console.log('[Leather Auth] 📊 Login completed via wallet:', {
      isNewUser,
      userId: userWithoutPassword.id,
      username: userWithoutPassword.username,
      blockchainConnected: userWithoutPassword.blockchainConnected,
      walletAddress
    });

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('[Leather Auth] ❌ Wallet authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during Leather wallet authentication'
    });
  }
});

// Authentication via Hedera wallet
// This endpoint handles wallet connection and authentication as a single login flow
router.post('/hedera', async (req, res) => {
  try {
    const { walletAddress, signature, message, network } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be filled'
      });
    }

    // Extract clean address from formats like hedera:mainnet:0.0.12345 or 0.0.12345
    let cleanAddress = walletAddress;
    if (walletAddress.startsWith('hedera:')) {
      // Extract address from format hedera:network:id
      const parts = walletAddress.split(':');
      cleanAddress = parts.slice(2).join(':');
    }
    
    // Check Hedera address format (0.0.12345)
    if (!/^\d+\.\d+\.\d+$/.test(cleanAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Hedera address format'
      });
    }

    // TODO: Signature verification for Hedera
    console.log(`[Hedera Auth] 🚀 Wallet login initiated for ${cleanAddress} on network ${network}`);
    console.log(`[Hedera Auth] Message: ${message}`);
    console.log(`[Hedera Auth] Signature: ${signature.substring(0, 20)}...`);

    // Find user by wallet address
    let user = await prisma.user.findFirst({
      where: {
        wallets: {
          some: {
            address: cleanAddress,
            type: 'hedera'
          }
        }
      },
      include: {
        wallets: true
      }
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user with wallet connection
      const username = `hedera_${cleanAddress.replace(/\./g, '_')}`;
      const displayName = `Hedera ${cleanAddress.split('.').pop()}`;

      user = await prisma.user.create({
        data: {
          username,
          displayName,
          blockchainConnected: true, // Mark as connected via wallet
          wallets: {
            create: {
              address: cleanAddress,
              type: 'hedera',
              network: network || 'mainnet',
              isPrimary: true
            }
          }
        },
        include: {
          wallets: true
        }
      });

      console.log(`[Hedera Auth] ✅ New user created and logged in via wallet: ${username}`);
    } else {
      // Existing user - update blockchainConnected flag and wallet info
      
      // Check if user has this wallet address
      const existingWallet = await prisma.wallet.findFirst({
        where: {
          userId: user.id,
          address: cleanAddress,
          type: 'hedera'
        }
      });

      // If wallet already exists, update network
      if (existingWallet && existingWallet.network !== network) {
        await prisma.wallet.update({
          where: {
            id: existingWallet.id
          },
          data: {
            network
          }
        });

        console.log(`[Hedera Auth] Wallet network updated: ${network}`);
      }

      // Update user to mark wallet login
      user = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          blockchainConnected: true, // Ensure flag is set for wallet login
          updatedAt: new Date() // Update timestamp to track last login
        },
        include: {
          wallets: true
        }
      });

      console.log(`[Hedera Auth] ✅ User logged in via wallet connection: ${user.username}`);
    }

    // Don't include password in response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('[Hedera Auth] 📊 Login completed via wallet:', {
      isNewUser,
      userId: userWithoutPassword.id,
      username: userWithoutPassword.username,
      displayName: userWithoutPassword.displayName,
      email: userWithoutPassword.email,
      blockchainConnected: userWithoutPassword.blockchainConnected,
      walletAddress: cleanAddress,
      network
    });

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('[Hedera Auth] ❌ Wallet authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during Hedera wallet authentication'
    });
  }
});

// Login or register via wallet
// This is a simplified endpoint for wallet login (used internally)
// Main wallet authentication should go through /hedera or /leather endpoints
router.post('/wallet-login', async (req, res) => {
  try {
    const { walletAddress, walletType, network } = req.body;

    if (!walletAddress || !walletType) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address or wallet type not specified'
      });
    }

    console.log(`[Wallet Login] 🚀 Wallet login initiated for ${walletAddress} (${walletType})`);

    // Find user by wallet address
    let user = await prisma.user.findFirst({
      where: {
        wallets: {
          some: {
            address: walletAddress,
            type: walletType
          }
        }
      },
      include: {
        wallets: true
      }
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user
      let username;
      let displayName;
      
      if (walletType === 'hedera') {
        username = `hedera_${walletAddress.replace(/\./g, '_')}`;
        displayName = `Hedera ${walletAddress.split('.').pop()}`;
      } else {
        // For other wallet types (e.g., evm)
        username = `wallet_${walletAddress.substring(2, 10)}`;
        displayName = `Wallet ${walletAddress.substring(2, 10)}`;
      }
      
      // Check if username is taken
      let usernameCounter = 1;
      let finalUsername = username;
      
      while (true) {
        const existingUser = await prisma.user.findUnique({
          where: { username: finalUsername }
        });
        
        if (!existingUser) break;
        finalUsername = `${username}_${usernameCounter}`;
        usernameCounter++;
      }
      
      user = await prisma.user.create({
        data: {
          username: finalUsername,
          displayName,
          blockchainConnected: true, // Mark as connected via wallet
          wallets: {
            create: {
              address: walletAddress,
              type: walletType,
              network: network || 'mainnet',
              isPrimary: true
            }
          }
        },
        include: {
          wallets: true
        }
      });

      console.log(`[Wallet Login] ✅ New user created and logged in via wallet: ${finalUsername}`);
    } else {
      // Check if user has this wallet address
      const existingWallet = user.wallets.find(
        wallet => wallet.address === walletAddress && wallet.type === walletType
      );
      
      if (!existingWallet) {
        // Add new wallet
        await prisma.wallet.create({
          data: {
            userId: user.id,
            address: walletAddress,
            type: walletType,
            network: network || 'mainnet',
            isPrimary: false
          }
        });
      } else if (network && existingWallet.network !== network) {
        // Update network for wallet
        await prisma.wallet.update({
          where: {
            id: existingWallet.id
          },
          data: {
            network
          }
        });
      }

      // Update user to mark wallet login
      user = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          blockchainConnected: true, // Ensure flag is set for wallet login
          updatedAt: new Date() // Update timestamp to track last login
        },
        include: {
          wallets: true
        }
      });

      console.log(`[Wallet Login] ✅ User logged in via wallet connection: ${user.username}`);
    }

    // Don't include password in response
    const { password: _, ...userWithoutPassword } = user;

    console.log('[Wallet Login] 📊 Login completed via wallet:', {
      isNewUser,
      userId: userWithoutPassword.id,
      username: userWithoutPassword.username,
      blockchainConnected: userWithoutPassword.blockchainConnected,
      walletAddress,
      walletType,
      network
    });

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('[Wallet Login] ❌ Wallet login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during wallet login'
    });
  }
});

// Current user information
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Don't include password in response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user data'
    });
  }
});

// Add wallet to existing account
router.post('/add-wallet', authMiddleware, async (req, res) => {
  try {
    const { address, type, network, isPrimary } = req.body;
    const userId = req.user.id;
    
    if (!address || !type) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address or wallet type not specified'
      });
    }
    
    // Check if wallet is already linked to another account
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        address,
        type
      }
    });
    
    if (existingWallet && existingWallet.userId !== userId) {
      return res.status(400).json({
        success: false,
        error: 'This wallet is already linked to another account'
      });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // If wallet should be primary, reset flag for other wallets
    if (isPrimary) {
      await prisma.wallet.updateMany({
        where: {
          userId,
          type
        },
        data: {
          isPrimary: false
        }
      });
    }
    
    // Create or update wallet
    let wallet;
    if (existingWallet) {
      wallet = await prisma.wallet.update({
        where: {
          id: existingWallet.id
        },
        data: {
          network: network || existingWallet.network,
          isPrimary: isPrimary !== undefined ? isPrimary : existingWallet.isPrimary
        }
      });
    } else {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          address,
          type,
          network: network || 'mainnet',
          isPrimary: isPrimary !== undefined ? isPrimary : false
        }
      });
    }
    
    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Add wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding wallet'
    });
  }
});

// Export using ES modules
export default router;