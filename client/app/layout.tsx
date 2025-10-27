import type { Metadata } from 'next';
import { Tektur } from 'next/font/google';
import './globals.css';

const tektur = Tektur({
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700', '800', '900'],
	variable: '--font-tektur',
	display: 'swap',
});

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
	title: 'W3P - Web3Pad',
	description:
		'Transform any screen into an instant multiplayer arena. Your phone becomes the controller. No downloads. No installations. Just scan and play.',
	keywords: [
		'multiplayer games',
		'mobile controller',
		'party games',
		'browser games',
		'QR code gaming',
		'instant gaming',
		'no download games',
	],
	authors: [{ name: 'W3P Team' }],
	icons: {
		icon: '/w3h-icon.jpg',
		shortcut: '/w3h-icon.jpg',
		apple: '/w3h-icon.jpg',
	},
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'W3P',
	},
	openGraph: {
		title: 'W3P - Web3Pad',
		description:
			'Turn any screen into an instant multiplayer arena. Your phone becomes the controller.',
		images: ['/w3h-logo.jpg'],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'W3P - Web3Pad',
		description:
			'Turn any screen into an instant multiplayer arena. Your phone becomes the controller.',
		images: ['/w3h-logo.jpg'],
	},
};

import { Providers } from './providers';
import { auth } from '@/lib/auth';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { Header } from '@/components/Header';

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();
	
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<meta name="theme-color" content="#000000" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
			</head>
			<body className={`${tektur.variable} antialiased`} suppressHydrationWarning>
				<Providers session={session}>
					<Header />
					<main className="min-h-screen">
						{children}
					</main>
					<PWAInstallPrompt />
				</Providers>
			</body>
		</html>
	);
}
