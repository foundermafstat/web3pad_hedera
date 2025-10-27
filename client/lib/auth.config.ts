import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

// Check environment variables
console.log('[NextAuth] Environment check:');
console.log('[NextAuth] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('[NextAuth] NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
console.log('[NextAuth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('[NextAuth] Auth config loaded at:', new Date().toISOString());
console.log('[NextAuth] Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('[NextAuth] GitHub Client ID:', process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET');

export const authConfig: NextAuthConfig = {
	trustHost: true,
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		GitHub({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			authorization: {
				params: {
					// Запрашиваем доступ к email, иначе GitHub может не предоставить его
					scope: 'read:user user:email'
				}
			},
			profile(profile) {
				console.log('GitHub profile:', profile);
				return {
					id: profile.id.toString(),
					name: profile.name || profile.login,
					email: profile.email,
					image: profile.avatar_url,
					username: profile.login,
				}
			},
		}),
		Credentials({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					console.log('[NextAuth] Attempting login for:', credentials.email);
					const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web3pad.xyz/api';
					const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
					console.log('[NextAuth] API URL:', apiUrl);
					const response = await fetch(
						`${apiUrl}/auth/login`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								email: credentials.email,
								password: credentials.password,
							}),
						}
					);

					console.log('[NextAuth] Login response status:', response.status);

					if (!response.ok) {
						const errorText = await response.text();
						console.error('[NextAuth] Login failed:', errorText);
						return null;
					}

					const user = await response.json();
					console.log('[NextAuth] Login successful for user:', user.username, 'displayName:', user.displayName);
					// Преобразуем displayName в name для NextAuth
					return {
						...user,
						name: user.displayName // Добавляем стандартное поле name для NextAuth
					};
				} catch (error) {
					console.error('Auth error:', error);
					return null;
				}
			},
		}),
		Credentials({
			id: 'blockchain',
			name: 'Blockchain',
			credentials: {
				walletAddress: { label: 'Wallet Address', type: 'text' },
				signature: { label: 'Signature', type: 'text' },
				message: { label: 'Message', type: 'text' },
			},
			async authorize(credentials) {
				if (!credentials?.walletAddress || !credentials?.signature || !credentials?.message) {
					return null;
				}

				// Validate Blockchain wallet address format
				try {
					if (!isValidBlockchainAddress(credentials.walletAddress as string)) {
						return null;
					}
				} catch (error) {
					console.error('[NextAuth] Invalid blockchain address:', error);
					return null;
				}

				try {
					console.log('[NextAuth] Attempting leather authentication...', {
						walletAddress: credentials.walletAddress,
						hasSignature: !!credentials.signature,
						messageLength: credentials.message ? (credentials.message as string).length : 0
					});

					// Verify signature on server
					const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web3pad.xyz/api';
					const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
					const response = await fetch(
						`${apiUrl}/auth/leather`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								walletAddress: credentials.walletAddress,
								signature: credentials.signature,
								message: credentials.message,
							}),
						}
					);

					console.log('[NextAuth] Server response status:', response.status);

					if (!response.ok) {
						const errorText = await response.text();
						console.error('[NextAuth] Server error:', errorText);
						return null;
					}

					const user = await response.json();
					console.log('[NextAuth] User data received:', {
						id: user.id,
						email: user.email,
						username: user.username
					});

					return {
						id: user.id,
						email: user.email,
						name: user.displayName,
						username: user.username,
						image: user.avatar,
						wallets: user.wallets || [],
					};
				} catch (error) {
					console.error('[NextAuth] Leather auth error:', error);
					return null;
				}
			},
		}),
		Credentials({
			id: 'hedera',
			name: 'Hedera Wallet',
			credentials: {
				walletAddress: { label: 'Hedera Account ID', type: 'text' },
				signature: { label: 'Signature', type: 'text' },
				message: { label: 'Message', type: 'text' },
				network: { label: 'Network', type: 'text' },
			},
			async authorize(credentials) {
				if (!credentials?.walletAddress || !credentials?.signature || !credentials?.message || !credentials?.network) {
					console.error('[NextAuth] Missing Hedera credentials');
					return null;
				}

				// Validate Hedera address format
				try {
					if (!isValidHederaAddress(credentials.walletAddress as string)) {
						console.error('[NextAuth] Invalid Hedera address format:', credentials.walletAddress);
						return null;
					}
				} catch (error) {
					console.error('[NextAuth] Invalid Hedera address:', error);
					return null;
				}

				try {
					console.log('[NextAuth] Attempting Hedera wallet authentication...', {
						walletAddress: credentials.walletAddress,
						network: credentials.network,
						hasSignature: !!credentials.signature,
						messageLength: credentials.message ? (credentials.message as string).length : 0
					});

					// Verify signature on server
					const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web3pad.xyz/api';
					const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
					const response = await fetch(
						`${apiUrl}/auth/hedera`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								walletAddress: credentials.walletAddress,
								signature: credentials.signature,
								message: credentials.message,
								network: credentials.network,
							}),
						}
					);

					console.log('[NextAuth] Hedera auth response status:', response.status);

					if (!response.ok) {
						const errorText = await response.text();
						console.error('[NextAuth] Hedera auth server error:', errorText);
						return null;
					}

					const responseData = await response.json();
					console.log('[NextAuth] Hedera auth response:', responseData);
					
					// Server returns { success: true, data: user }
					const user = responseData.data || responseData;
					
					console.log('[NextAuth] Hedera user data received:', {
						id: user?.id,
						email: user?.email || null,
						username: user?.username
					});

					return {
						id: user.id,
						email: user.email || `hedera_${credentials.walletAddress}@hedera.local`,
						name: user.displayName || user.username || `Hedera User`,
						username: user.username,
						image: user.avatar,
						wallets: user.wallets || [{
							address: credentials.walletAddress,
							type: 'hedera',
							network: credentials.network,
							isPrimary: true
						}],
						network: credentials.network,
					};
				} catch (error) {
					console.error('[NextAuth] Hedera auth error:', error);
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: '/auth/signin',
		error: '/auth/error',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			// Leather sign in - already handled in authorize
			if (account?.provider === 'leather') {
				return true;
			}
			
			// OAuth sign in
			if (account?.provider === 'google' || account?.provider === 'github') {
				try {
					console.log('[NextAuth] OAuth sign in attempt:', {
						provider: account.provider,
						providerAccountId: account.providerAccountId,
						email: user.email,
						name: user.name,
						hasImage: !!user.image,
					});
					
					// Проверка наличия email в GitHub профиле
					if (account.provider === 'github' && !user.email) {
						console.error('[NextAuth] GitHub email missing. Check GitHub privacy settings.');
						return '/auth/error?error=GitHubEmailPrivate';
					}
					
					// Register/login OAuth user on server
					const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web3pad.xyz/api';
					const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
					console.log('[NextAuth] Making OAuth request to:', `${apiUrl}/auth/oauth`);
					
					const oauthData = {
						provider: account.provider,
						providerId: account.providerAccountId,
						email: user.email,
						name: user.name,
						image: user.image,
					};
					
					console.log('[NextAuth] OAuth request data:', oauthData);
					
					const response = await fetch(
						`${apiUrl}/auth/oauth`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(oauthData),
						}
					);

					console.log('[NextAuth] OAuth response status:', response.status);

					if (!response.ok) {
						const errorText = await response.text();
						console.error('OAuth registration failed:', errorText);
						return `/auth/error?error=OAuthServerError&provider=${account.provider}&status=${response.status}`;
					}

					const serverUser = await response.json();
					console.log('[NextAuth] Server user data:', {
						id: serverUser.id,
						email: serverUser.email,
						username: serverUser.username,
					});
					
					// Merge server user data
					user.id = serverUser.id;
					user.username = serverUser.username;
					user.image = serverUser.avatar || user.image; // Use server avatar
					
					return true;
				} catch (error) {
					console.error('[NextAuth] OAuth error:', error);
					const errorMessage = error instanceof Error ? error.message : "Unknown error";
					return `/auth/error?error=OAuthProcessError&provider=${account.provider}&message=${encodeURIComponent(errorMessage)}`;
				}
			}

			return true;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
				token.username = (user as any).username;
				token.email = user.email;
				token.name = user.name; // Store display name in token
				token.picture = user.image; // Store avatar in token
				token.wallets = (user as any).wallets || []; // Store wallets
				token.displayName = (user as any).displayName || user.name; // Сохраняем displayName для совместимости
				
				// Отладка
				console.log('[NextAuth] JWT user data:', { 
					id: user.id,
					name: user.name,
					email: user.email,
					username: (user as any).username,
					displayName: (user as any).displayName 
				});
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.name = token.name as string; // Устанавливаем имя из токена
				(session.user as any).username = token.username;
				(session.user as any).displayName = token.displayName; // Добавляем displayName в сессию
				session.user.image = token.picture as string; // Set avatar from token
				(session.user as any).wallets = (token.wallets as any) || []; // Set wallets
				
				// Отладка
				console.log('[NextAuth] Session user data:', {
					id: session.user.id,
					name: session.user.name,
					email: session.user.email,
					username: (session.user as any).username,
					displayName: (session.user as any).displayName
				});
			}
			return session;
		},
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
};

function isValidBlockchainAddress(address: string): boolean {
	// Простая проверка, чтобы избежать ошибки линтера
	// Можно реализовать более сложную валидацию
	return address.length > 10 && address.startsWith('0x');
}

function isValidHederaAddress(address: string): boolean {
	// Check Hedera address format (0.0.12345 or hedera:network:0.0.12345)
	const cleanAddress = address.startsWith('hedera:') 
		? address.split(':').slice(2).join(':') 
		: address;
	return /^\d+\.\d+\.\d+$/.test(cleanAddress);
}

