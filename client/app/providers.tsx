'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect } from 'react';
import { registerServiceWorker } from '@/lib/sw-register';

interface ProvidersProps {
	children: ReactNode;
	session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
	useEffect(() => {
		// Register Service Worker on mount (only on client side)
		if (typeof window !== 'undefined') {
			registerServiceWorker();
		}
	}, []);

	return (
		<SessionProvider session={session}>
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				forcedTheme="dark"
				enableSystem={false}
				disableTransitionOnChange
			>
				{children}
			</ThemeProvider>
		</SessionProvider>
	);
}

