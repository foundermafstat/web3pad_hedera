import { GamesListView } from '@/components/games/GamesListView';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function GameHistoryPage() {
	return (
		<PageWithFooter>
			<div className="min-h-screen bg-background">
				<div className="container mx-auto max-w-7xl py-8 pt-16">
					<GamesListView />
				</div>
			</div>
		</PageWithFooter>
	);
}
