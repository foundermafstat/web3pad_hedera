'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserMenu } from './UserMenu';
import { HeaderAuthButton } from './HeaderAuthButton';
import { ThemeLogo } from './ThemeLogo';
import { MobileNavigation } from './MobileNavigation';
import { DesktopNavigation } from './DesktopNavigation';

export function Header() {
	const { data: session } = useSession();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 w-full">

				<div className="h-10 md:h-16 flex items-center">
					<div className="container mx-auto max-w-7xl relative flex items-center justify-between px-4">
						{/* Mobile Navigation - Left side */}
						<div className="md:hidden flex items-center mr-4">
							<MobileNavigation />
						</div>

						{/* Logo - Centered on mobile, left on desktop */}
						<div className="flex-1 md:flex-none flex justify-start">
							<Link href="/" className="flex items-center hover:opacity-80 transition-opacity text-white">
								<ThemeLogo
									className="object-contain md:w-[78px] md:h-[52px] w-[50px] h-[33px]"
									color="#ffffff"
								/>
							</Link>
						</div>

						{/* Navigation Menu - Centered on desktop */}
						<div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
							<DesktopNavigation />
						</div>

						{/* Auth section */}
						<div className="flex items-center gap-4">
							{session?.user ? (
								<UserMenu user={session.user} />
							) : (
								<HeaderAuthButton />
							)}
						</div>
					</div>
				</div>
			
		</header>
	);
}

