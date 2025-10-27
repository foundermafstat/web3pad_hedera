'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';

interface SignUpFormProps {
	onSuccess: () => void;
	onError: (error: string) => void;
}

export function SignUpForm({ onSuccess, onError }: SignUpFormProps) {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [displayName, setDisplayName] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		onError('');

		// Validation
		if (password.length < 6) {
			onError('Password must be at least 6 characters');
			setLoading(false);
			return;
		}

		if (username.length < 3) {
			onError('Username must be at least 3 characters');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password,
					username,
					displayName: displayName || username,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				onError(data.error || 'Registration failed');
				setLoading(false);
				return;
			}

			// Auto sign in after registration
			const signInResult = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (signInResult?.error) {
				onError('Registration successful, but sign in failed. Please sign in manually.');
			} else {
				onSuccess();
			}
		} catch (err) {
			onError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthSignIn = async (provider: 'google' | 'github') => {
		setLoading(true);
		onError('');

		try {
			// For OAuth, use redirect: true to properly redirect to provider
			await signIn(provider, {
				callbackUrl: window.location.origin,
			});
		} catch (err) {
			onError('Authentication error. Please try again.');
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			{/* OAuth Buttons */}
			<div className="space-y-3">
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={() => handleOAuthSignIn('google')}
					disabled={loading}
				>
					<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="currentColor"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="currentColor"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="currentColor"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					Continue with Google
				</Button>

				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={() => handleOAuthSignIn('github')}
					disabled={loading}
				>
					<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					Continue with GitHub
				</Button>

				<Button
					type="button"
					variant="outline"
					className="w-full"
					
					
				>
					<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
						<path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zM12 16h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
					</svg>
					Connect Wallet
				</Button>
			</div>

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border"></div>
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with email
					</span>
				</div>
			</div>

			{/* Email Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="signup-username" className="text-sm font-medium">
						Username
					</label>
					<input
						id="signup-username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="username"
						className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						required
						disabled={loading}
						minLength={3}
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="signup-displayname" className="text-sm font-medium">
						Display Name <span className="text-muted-foreground">(optional)</span>
					</label>
					<input
						id="signup-displayname"
						type="text"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						placeholder="Your name"
						className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						disabled={loading}
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="signup-email" className="text-sm font-medium">
						Email
					</label>
					<input
						id="signup-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="email@example.com"
						className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						required
						disabled={loading}
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="signup-password" className="text-sm font-medium">
						Password
					</label>
					<input
						id="signup-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
						className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						required
						disabled={loading}
						minLength={6}
					/>
					<p className="text-xs text-muted-foreground">Minimum 6 characters</p>
				</div>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? (
						<span className="flex items-center justify-center">
							<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
							Loading...
						</span>
					) : (
						'Create Account'
					)}
				</Button>
			</form>
		</div>
	);
}

