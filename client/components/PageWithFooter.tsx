'use client';

import { Footer } from './Footer';

interface PageWithFooterProps {
	children: React.ReactNode;
}

export function PageWithFooter({ children }: PageWithFooterProps) {
	return (
		<>
			{children}
			<Footer />
		</>
	);
}
