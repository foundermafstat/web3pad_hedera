'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { User } from 'next-auth';

interface UserMenuProps {
	user: User;
}

export function UserMenu({ user }: UserMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const getInitials = () => {
		if (user.name) {
			return user.name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2);
		}
		if (user.email) {
			return user.email[0].toUpperCase();
		}
		return 'U';
	};

	const handleSignOut = async () => {
		await signOut({ callbackUrl: '/' });
	};

	return (
		<div className="relative" ref={menuRef}>
			{/* Avatar button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 rounded-sm hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				aria-label="User menu"
			>
				{user.image ? (
					<img
						src={user.image}
						alt={user.name || 'User'}
						className="w-7 h-7 md:w-10 md:h-10 rounded-sm object-cover"
						crossOrigin="anonymous"
						referrerPolicy="no-referrer"
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
							target.nextElementSibling?.classList.remove('hidden');
						}}
					/>
				) : null}
				<div className={`w-7 h-7 md:w-10 md:h-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-medium ${user.image ? 'hidden' : ''}`}>
					{getInitials()}
				</div>
			</button>

			{/* Dropdown menu */}
			{isOpen && (
				<div className="absolute right-0 mt-2 w-64 rounded-md border border-border bg-popover shadow-lg zoom-in-95">
					<div className="p-4 border-b border-border">
						<div className="flex items-center gap-3">
							{user.image ? (
								<img
									src={user.image}
									alt={user.name || 'User'}
									className="w-12 h-12 rounded-sm object-cover"
									crossOrigin="anonymous"
									referrerPolicy="no-referrer"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.style.display = 'none';
										target.nextElementSibling?.classList.remove('hidden');
									}}
								/>
							) : null}
							<div className={`w-12 h-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-base font-medium ${user.image ? 'hidden' : ''}`}>
								{getInitials()}
							</div>
							<div className="flex-1 min-w-0">
								{user.name && (
									<p className="text-sm font-medium text-foreground truncate">
										{user.name}
									</p>
								)}
								{user.email && (
									<p className="text-xs text-muted-foreground truncate">
										{user.email}
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="p-2">
						<Link
							href={`/profile/${encodeURIComponent(user.username || user.email?.split('@')[0] || user.id)}`}
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
							Profile
						</Link>

						<button
							onClick={handleSignOut}
							className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							Sign Out
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

