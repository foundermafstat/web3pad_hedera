import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			username?: string;
			walletAddress?: string;
		} & DefaultSession['user'];
	}

	interface User {
		username?: string;
		walletAddress?: string;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string;
		username?: string;
		walletAddress?: string;
	}
}

