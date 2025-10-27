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
					console.log('[NextAuth] Login successful for user:', user.username);
					return user;
				} catch (error) {
					console.error('Auth error:', error);
					return null;
				}
			},
		}),
		Credentials({
			id: 'leather',
			name: 'Leather',
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
				if (!isValidBlockchainAddress(credentials.walletAddress as string)) {
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
						walletAddress: user.walletAddress,
					};
				} catch (error) {
					console.error('[NextAuth] Leather auth error:', error);
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
						email: user.email,
						name: user.name
					});
					
					// Register/login OAuth user on server
					const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web3pad.xyz/api';
					const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
					console.log('[NextAuth] Making OAuth request to:', `${apiUrl}/auth/oauth`);
					
					const response = await fetch(
						`${apiUrl}/auth/oauth`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								provider: account.provider,
								providerId: account.providerAccountId,
								email: user.email,
								name: user.name,
								image: user.image,
							}),
						}
					);

					console.log('[NextAuth] OAuth response status:', response.status);

					if (!response.ok) {
						const errorText = await response.text();
						console.error('OAuth registration failed:', errorText);
						return false;
					}

					const serverUser = await response.json();
					
					// Merge server user data
					user.id = serverUser.id;
					user.username = serverUser.username;
					user.image = serverUser.avatar || user.image; // Use server avatar
					
					return true;
				} catch (error) {
					console.error('OAuth error:', error);
					return false;
				}
			}

			return true;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
				token.username = (user as any).username;
				token.email = user.email;
				token.picture = user.image; // Store avatar in token
				token.walletAddress = (user as any).walletAddress; // Store wallet address
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				(session.user as any).username = token.username;
				session.user.image = token.picture as string; // Set avatar from token
				(session.user as any).walletAddress = token.walletAddress as string; // Set wallet address
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

function isValidBlockchainAddress(arg0: string) {
	throw new Error('Function not implemented.');
}

