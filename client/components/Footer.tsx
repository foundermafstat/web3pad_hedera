'use client';

import Link from 'next/link';
import { ThemeLogo } from './ThemeLogo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
	FaTwitter, 
	FaGithub, 
	FaPaperPlane, 
	FaComment, 
	FaComments, 
	FaUsers,
	FaGamepad,
	FaUsers as FaUsersIcon,
	FaTrophy,
	FaCog,
	FaInfo,
	FaShieldAlt,
	FaEnvelope,
	FaExternalLinkAlt,
	FaTelegramPlane,
	FaRedditAlien,
	FaDiscord,
	FaMedium
} from 'react-icons/fa';
import { BiLogoInstagramAlt } from 'react-icons/bi';
import { useState } from 'react';

interface SocialLink {
	name: string;
	icon: React.ReactNode;
	href: string;
	label: string;
}

interface GameLink {
	name: string;
	href: string;
	description: string;
}

interface MainLink {
	name: string;
	href: string;
	icon?: React.ReactNode;
}

export function Footer() {
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const socialLinks: SocialLink[] = [
		{
			name: 'Twitter',
			icon: <FaTwitter className="w-5 h-5" />,
			href: 'https://twitter.com/web3padxyz',
			label: 'Follow us on Twitter'
		},
		{
			name: 'Instagram',
			icon: <BiLogoInstagramAlt className="w-5 h-5" />,
			href: 'https://instagram.com/web3padxyz',
			label: 'Follow us on Instagram'
		},
		{
			name: 'GitHub',
			icon: <FaGithub className="w-5 h-5" />,
			href: 'https://github.com/web3padxyz',
			label: 'View our GitHub'
		},
		{
			name: 'Telegram',
			icon: <FaTelegramPlane className="w-5 h-5" />,
			href: 'https://t.me/web3padxyz',
			label: 'Join our Telegram'
		},
		{
			name: 'Reddit',
			icon: <FaRedditAlien className="w-5 h-5" />,
			href: 'https://reddit.com/r/web3padxyz',
			label: 'Join our Reddit community'
		},
		{
			name: 'Discord',
			icon: <FaDiscord className="w-5 h-5" />,
			href: 'https://discord.gg/web3padxyz',
			label: 'Join our Discord server'
		},
		{
			name: 'Medium',
			icon: <FaMedium className="w-5 h-5" />,
			href: 'https://medium.com/@web3padxyz',
			label: 'Read our Medium articles'
		}
	];

	const gameLinks: GameLink[] = [
		{
			name: 'Shooter Game',
			href: '/games/shooter',
			description: 'Fast-paced action shooter'
		},
		{
			name: 'Race Game',
			href: '/games/race',
			description: 'High-speed racing experience'
		},
		{
			name: 'Quiz Game',
			href: '/games/quiz',
			description: 'Test your knowledge'
		},
		{
			name: 'Tower Defence',
			href: '/games/towerdefence',
			description: 'Strategic tower defense'
		}
	];

	const mainLinks: MainLink[] = [
		{
			name: 'Games',
			href: '/games',
			icon: <FaGamepad className="w-4 h-4" />
		},
		{
			name: 'Leaderboard',
			href: '/leaderboard',
			icon: <FaTrophy className="w-4 h-4" />
		},
		{
			name: 'Players',
			href: '/players',
			icon: <FaUsers className="w-4 h-4" />
		},
		{
			name: 'Achievements',
			href: '/achievements',
			icon: <FaTrophy className="w-4 h-4" />
		},
		{
			name: 'NFT',
			href: '/nft',
			icon: <FaShieldAlt className="w-4 h-4" />
		},
		{
			name: 'Contracts',
			href: '/contracts',
			icon: <FaCog className="w-4 h-4" />
		}
	];

	const handleWhitelistSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || isSubmitting) return;

		setIsSubmitting(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			setIsSubmitted(true);
			setEmail('');
		} catch (error) {
			console.error('Failed to subscribe:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<footer className="bg-background border-t border-border">
			<div className="container mx-auto max-w-7xl px-2 py-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Logo and Social Links */}
					<div className="lg:col-span-1">
						<div className="mb-6">
							<Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
								<ThemeLogo
									width={72}
									height={52}
									className="text-primary"
									color="#11ff33"
								/>
							</Link>
							<p className="text-muted-foreground mt-4 text-sm leading-relaxed">
								Transform any screen into an instant multiplayer arena. 
								Your phone becomes the controller.
							</p>
						</div>
						
						{/* Social Links */}
						<div className="flex flex-wrap gap-1">
							{socialLinks.map((social) => (
								<Link
									key={social.name}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors group"
									aria-label={social.label}
								>
									{social.icon}
								</Link>
							))}
						</div>
					</div>

					{/* Games Menu */}
					<div>
						<h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
							<FaGamepad className="w-5 h-5 text-primary" />
							Games
						</h3>
						<nav className="space-y-3">
							{gameLinks.map((game) => (
								<Link
									key={game.name}
									href={game.href}
									className="block group hover:text-primary transition-colors"
								>
									<div className="font-medium group-hover:underline">
										{game.name}
									</div>
									<div className="text-sm text-muted-foreground">
										{game.description}
									</div>
								</Link>
							))}
						</nav>
					</div>

					{/* Main Links */}
					<div>
						<h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
							<FaExternalLinkAlt className="w-5 h-5 text-primary" />
							Navigation
						</h3>
						<nav className="space-y-3">
							{mainLinks.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
								>
									{link.icon}
									<span className="group-hover:underline">
										{link.name}
									</span>
								</Link>
							))}
						</nav>
					</div>

					{/* Whitelist Subscription */}
					<div>
						<h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
							<FaEnvelope className="w-5 h-5 text-primary" />
							Newsletter
						</h3>
						<p className="text-muted-foreground text-sm mb-4">
							Get notified about new games and features
						</p>
						
						{isSubmitted ? (
							<div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
								<div className="flex items-center gap-2">
									<FaEnvelope className="w-4 h-4" />
									<span className="text-sm font-medium">
										Thank you for subscribing!
									</span>
								</div>
								<p className="text-xs mt-1">
									We'll notify you about new features
								</p>
							</div>
						) : (
							<form onSubmit={handleWhitelistSubmit} className="space-y-3">
								<Input
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="w-full"
								/>
								<Button 
									type="submit" 
									disabled={isSubmitting || !email}
									className="w-full"
								>
									{isSubmitting ? (
										<>
											<div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
											Subscribing...
										</>
									) : (
										<>
											<FaPaperPlane className="w-4 h-4 mr-2" />
											Subscribe
										</>
									)}
								</Button>
							</form>
						)}
					</div>
				</div>

				{/* Bottom Section */}
				<div className="mt-12 pt-8 border-t border-border">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="text-sm text-muted-foreground">
							© 2025 Web3Pad. All rights reserved.
						</div>
						<div className="flex items-center gap-6 text-sm">
							<Link 
								href="/privacy" 
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Privacy Policy
							</Link>
							<Link 
								href="/terms" 
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Terms of Service
							</Link>
							<Link 
								href="/contact" 
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								Contact
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
