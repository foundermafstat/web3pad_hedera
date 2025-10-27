import Link from 'next/link';
import { FaUserTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

export default function ProfileNotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
					<FaUserTimes className="w-10 h-10 text-muted-foreground" />
				</div>
				<h1 className="text-4xl font-bold mb-2">User Not Found</h1>
				<p className="text-muted-foreground mb-6">
					The profile you're looking for doesn't exist or has been removed.
				</p>
				<div className="flex gap-4 justify-center">
					<Button asChild variant="outline">
						<Link href="/">Go Home</Link>
					</Button>
					<Button asChild>
						<Link href="/leaderboard">View Leaderboard</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

