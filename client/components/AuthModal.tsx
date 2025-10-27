'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaTimes, FaEnvelope, FaLock, FaUser, FaGithub, FaChrome, FaWallet, FaLayerGroup } from 'react-icons/fa';

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
	const [mode, setMode] = useState<'signin' | 'signup'>('signin');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// Form state
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [displayName, setDisplayName] = useState('');

	const handleOAuthSignIn = async (provider: 'google' | 'github') => {
		setLoading(true);
		setError('');
		
		try {
			const result = await signIn(provider, {
				callbackUrl: window.location.href,
				redirect: false,
			});

			if (result?.error) {
				setError('Authentication failed. Please try again.');
			} else {
				onSuccess();
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError('Invalid email or password');
			} else {
				onSuccess();
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handleEmailSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		// Validation
		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			setLoading(false);
			return;
		}

		if (username.length < 3) {
			setError('Username must be at least 3 characters');
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
				setError(data.error || 'Registration failed');
				return;
			}

			// Auto sign in after registration
			const signInResult = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (signInResult?.error) {
				setError('Registration successful, but sign in failed. Please sign in manually.');
			} else {
				onSuccess();
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
			<div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 rounded-t-2xl">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-background/10 rounded-md"
					>
						<FaTimes className="w-6 h-6" />
					</button>

					<div className="text-center">
						<h2 className="text-2xl font-bold text-white mb-2">
							{mode === 'signin' ? 'Sign In' : 'Create Account'}
						</h2>
						<p className="text-blue-100 text-sm">
							{mode === 'signin'
								? 'Welcome back! Sign in to continue'
								: 'Join now to save your progress'}
						</p>
					</div>
				</div>

				<div className="p-6 space-y-6">
					{/* Error Message */}
					{error && (
						<div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-red-400 text-sm">
							{error}
						</div>
					)}

					{/* OAuth Buttons */}
					<div className="space-y-3">
						<button
							onClick={() => handleOAuthSignIn('google')}
							disabled={loading}
							className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-background hover:bg-gray-100 text-gray-800 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<FaChrome className="w-5 h-5" />
							<span>Continue with Google</span>
						</button>

						<button
							onClick={() => handleOAuthSignIn('github')}
							disabled={loading}
							className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
						>
							<FaGithub className="w-5 h-5" />
							<span>Continue with GitHub</span>
						</button>
						
						<button
							
						
							className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<FaWallet className="w-5 h-5" />
							<span>Connect Wallet</span>
						</button>
					</div>

					{/* Divider */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-700"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-gray-800 text-gray-400">
								Or continue with email
							</span>
						</div>
					</div>

					{/* Email Form */}
					<form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
						{mode === 'signup' && (
							<>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Username
									</label>
									<div className="relative">
										<FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											placeholder="Enter username"
											className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											disabled={loading}
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Display Name (Optional)
									</label>
									<div className="relative">
										<FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type="text"
											value={displayName}
											onChange={(e) => setDisplayName(e.target.value)}
											placeholder="Enter display name"
											className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
											disabled={loading}
										/>
									</div>
								</div>
							</>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Email
							</label>
							<div className="relative">
								<FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter email"
									className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Password
							</label>
							<div className="relative">
								<FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter password"
									className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
									disabled={loading}
									minLength={6}
								/>
							</div>
							{mode === 'signup' && (
								<p className="text-xs text-gray-400 mt-1">
									Minimum 6 characters
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-md font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
									Processing...
								</span>
							) : mode === 'signin' ? (
								'Sign In'
							) : (
								'Create Account'
							)}
						</button>
					</form>

					{/* Toggle Mode */}
					<div className="text-center">
						<button
							onClick={() => {
								setMode(mode === 'signin' ? 'signup' : 'signin');
								setError('');
							}}
							className="text-sm text-gray-400 hover:text-white transition-colors"
						>
							{mode === 'signin' ? (
								<>
									Don't have an account?{' '}
									<span className="text-blue-400 font-semibold">Sign up</span>
								</>
							) : (
								<>
									Already have an account?{' '}
									<span className="text-blue-400 font-semibold">Sign in</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthModal;

