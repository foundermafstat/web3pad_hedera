'use client';

import Link from 'next/link';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import React from 'react';
import { 
	FaInfo,
	FaGamepad,
	FaTrophy,
	FaUsers,
	FaHistory,
	FaBullseye,
	FaAward,
	FaChartBar,
	FaMobile,
	FaBolt,
	FaGlobe,
	FaCrown,
	FaMedal,
	FaStar,
	FaPlay,
	FaLayerGroup,
	FaFileAlt,
	FaExchangeAlt
} from 'react-icons/fa';
import { ThemeLogo } from './ThemeLogo';

// Games for navigation
const games: { title: string; href: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{
		title: "Battle Arena",
		href: "/games/shooter",
		description: "Top-down multiplayer shooter. Fight bots and other players in real-time battles.",
		icon: FaBullseye,
	},
	{
		title: "Race Track", 
		href: "/games/race",
		description: "Competitive racing with obstacles. Control your car using device gyroscope.",
		icon: FaBolt,
	},
	{
		title: "Quiz Battle",
		href: "/games/quiz", 
		description: "Real-time trivia game with friends. Test your knowledge across categories.",
		icon: FaAward,
	},
	{
		title: "Tower Defence",
		href: "/games/towerdefence",
		description: "Strategic castle defense against waves of enemies. Build and upgrade towers.",
		icon: FaTrophy,
	},
	{
		title: "Gyro Test",
		href: "/games/gyrotest",
		description: "Test gyroscope and vibration features of your mobile device.",
		icon: FaMobile,
	},
];

function ListItem({
	title,
	children,
	href,
	icon: Icon,
	...props
}: React.ComponentPropsWithoutRef<"li"> & { 
	href: string; 
	icon?: React.ComponentType<{ className?: string }>; 
}) {
	return (
		<li {...props}>
			<NavigationMenuLink asChild>
				<Link 
					href={href}
					className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
				>
					<div className="text-sm leading-none font-medium flex items-center gap-2">
						{Icon && <Icon className="w-4 h-4" />}
						{title}
					</div>
					<p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
						{children}
					</p>
				</Link>
			</NavigationMenuLink>
		</li>
	);
}

export function DesktopNavigation() {

	return (
		<NavigationMenu className="hidden md:flex" viewport={false}>
			<div className="bg-background/20 backdrop-blur-sm rounded-md p-2">
			<NavigationMenuList>
				{/* About Project - Featured Layout */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>About</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
							<li className="row-span-3">
								<NavigationMenuLink asChild>
									<Link
										className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
										href="/about"
									>
										<div className="text-primary">
                                        <ThemeLogo 
                                            width={60} 
                                            height={39} 
                                            color="currentColor"
                                        />
										</div>
										
										<div className="mt-2 mb-2 text-lg font-medium">
											WEB3PAD
										</div>
										<p className="text-muted-foreground text-sm leading-tight">
											Revolutionary WEB3 gaming platform with mobile controller technology
										</p>
									</Link>
								</NavigationMenuLink>
							</li>
							<ListItem href="/web3" title="Web3 Integration" icon={FaInfo}>
								Blockchain-powered gaming with NFT rewards and decentralized results storage
							</ListItem>
							
							<ListItem href="/about/controller" title="Controller Mechanics" icon={FaMobile}>
								How your smartphone transforms into a professional game controller
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				{/* Games - Grid Layout */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>Games</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
							{games.map((game) => (
								<ListItem
									key={game.title}
									title={game.title}
									href={game.href}
									icon={game.icon}
								>
									{game.description}
								</ListItem>
							))}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				{/* Community - List Layout */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>Community</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[250px] gap-2">
							<li>
								<NavigationMenuLink asChild>
									<Link href="/leaderboard" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<FaCrown className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Leaderboard</div>
											</div>
											
											<div className="text-muted-foreground text-sm">
												Game rankings and top players
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/players" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<FaUsers className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">All Players</div>
											</div>
											<div className="text-muted-foreground text-sm">
												Browse community members
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/achievements" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<FaMedal className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Achievements</div>
											</div>
											<div className="text-muted-foreground text-sm">
												Unlock rewards and badges
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/contracts" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<FaFileAlt className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Contracts</div>
											</div>
											<div className="text-muted-foreground text-sm">
												Manage blockchain contracts
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/swap" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<FaExchangeAlt className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Token Swap</div>
											</div>
											<div className="text-muted-foreground text-sm">
												Exchange HBAR for HPLAY tokens
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>


				{/* History - With Icons */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>History</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[200px] gap-2">
							<li>
								<NavigationMenuLink asChild>
									<Link href="/games/history" className="flex gap-2 rounded-md hover:bg-accent">
										<div>
											<div className="flex">
												<FaHistory className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Game Sessions</div>
											</div>
											
											<div className="text-muted-foreground text-sm">
												View ended game sessions
											</div>
										</div>
										
									</Link>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
			</div>
		</NavigationMenu>
	);
}
