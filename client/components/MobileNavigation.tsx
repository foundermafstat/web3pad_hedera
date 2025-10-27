'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
	Sheet, 
	SheetContent, 
	SheetDescription, 
	SheetHeader, 
	SheetTitle, 
	SheetTrigger 
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
	FaBars,
	FaInfo,
	FaGamepad,
	FaTrophy,
	FaUsers,
	FaHistory,
	FaBullseye,
	FaAward,
	FaChartBar,
	FaChevronRight,
	FaTimes,
	FaCubes
} from 'react-icons/fa';

interface NavigationItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	description?: string;
}

interface NavigationSection {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
	{
		title: 'About',
		icon: FaInfo,
		items: [
			{
				title: 'Web3 Integration',
				href: '/web3',
				icon: FaCubes,
				description: 'Blockchain-powered gaming with NFT rewards'
			},
			{
				title: 'Project Overview',
				href: '/about',
				icon: FaInfo,
				description: 'Learn more about our unique platform'
			},
			{
				title: 'Controller Mechanics',
				href: '/about/controller',
				icon: FaBullseye,
				description: 'How your smartphone becomes a game controller'
			}
		]
	},
	{
		title: 'Games',
		icon: FaGamepad,
		items: [
			{
				title: 'All Games',
				href: '/games',
				icon: FaTrophy,
				description: 'Browse available games catalog'
			},
			{
				title: 'Game History',
				href: '/games/history',
				icon: FaHistory,
				description: 'Completed game sessions'
			},
			{
				title: 'Battle Arena',
				href: '/games/shooter',
				icon: FaBullseye,
				description: 'Multiplayer top-down shooter'
			},
			{
				title: 'Race Track',
				href: '/games/race',
				icon: FaGamepad,
				description: 'Competitive racing with gyroscope'
			},
			{
				title: 'Quiz Battle',
				href: '/games/quiz',
				icon: FaAward,
				description: 'Real-time trivia game'
			},
			{
				title: 'Tower Defence',
				href: '/games/towerdefence',
				icon: FaTrophy,
				description: 'Strategic castle defense'
			}
		]
	},
	{
		title: 'Community',
		icon: FaUsers,
		items: [
			{
				title: 'Leaderboard',
				href: '/leaderboard',
				icon: FaChartBar,
				description: 'Game rankings and top players'
			},
			{
				title: 'All Players',
				href: '/players',
				icon: FaUsers,
				description: 'Browse community members'
			},
		]
	}
];

export function MobileNavigation() {
	const [isOpen, setIsOpen] = useState(false);

	const handleLinkClick = () => {
		setIsOpen(false);
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm">
					<FaBars className="h-6 w-6" />
					<span className="sr-only">Open menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent 
				side="right" 
				className="w-[300px] sm:w-[350px] p-0 flex flex-col"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<SheetHeader className="p-6 pb-4 flex-shrink-0">
					<div className="flex items-center justify-between">
						<div>
							<SheetTitle className="text-lg font-bold">W3P Platform</SheetTitle>
							<SheetDescription className="text-sm">
								Gaming platform with mobile controller technology
							</SheetDescription>
						</div>
						{/* <Button 
							variant="ghost" 
							size="sm" 
							className="h-8 w-8 p-0"
							onClick={() => setIsOpen(false)}
						>
							<FaTimes className="h-4 w-4" />
						</Button> */}
					</div>
				</SheetHeader>

				<div className="px-6 pb-6 flex-1 overflow-y-auto">
					<nav className="space-y-6">
						{navigationSections.map((section, sectionIndex) => {
							const SectionIcon = section.icon;
							return (
								<div key={section.title} className="space-y-3">
									{/* Section Header */}
									<div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
										<SectionIcon className="h-4 w-4" />
										{section.title}
									</div>

									{/* Section Items */}
									<div className="space-y-1 ml-6">
										{section.items.map((item) => {
											const ItemIcon = item.icon;
											return (
												<Link
													key={item.href}
													href={item.href}
													onClick={handleLinkClick}
													className="flex items-center justify-between p-2 -mx-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
												>
													<div className="flex items-center gap-3 min-w-0 flex-1">
														<ItemIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
														<div className="min-w-0">
															<div className="font-medium truncate">{item.title}</div>
															{item.description && (
																<div className="text-xs text-muted-foreground truncate">
																	{item.description}
																</div>
															)}
														</div>
													</div>
													<FaChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
												</Link>
											);
										})}
									</div>

									{/* Separator between sections */}
									{sectionIndex < navigationSections.length - 1 && (
										<Separator className="mt-4" />
									)}
								</div>
							);
						})}
					</nav>

					{/* Additional Actions */}
					<div className="mt-8 pt-6 border-t">
						<div className="space-y-2">
							<Link href="/profile" onClick={handleLinkClick}>
								<Button variant="outline" className="w-full justify-start" size="sm">
									<FaUsers className="h-4 w-4 mr-2" />
									My Profile
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
