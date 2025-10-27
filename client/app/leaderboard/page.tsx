import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function LeaderboardPage() {
	return (
		<PageWithFooter>
			<div className="min-h-full bg-background pt-16">
				<LeaderboardView />
			</div>
		</PageWithFooter>
	);
}

