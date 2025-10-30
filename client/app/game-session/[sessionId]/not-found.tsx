import Link from 'next/link';
import { FaGamepad } from 'react-icons/fa';

export default function GameSessionNotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="text-center max-w-md">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
					<FaGamepad className="w-10 h-10 text-muted-foreground" />
				</div>
				<h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
				<p className="text-muted-foreground mb-8">
					Unfortunately, the requested game session does not exist or has been deleted.
				</p>
				<Link
					href="/"
					className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
				>
					Return to Home
				</Link>
			</div>
		</div>
	);
}

