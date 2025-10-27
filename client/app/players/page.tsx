import { PlayersListView } from '@/components/players/PlayersListView';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function PlayersPage() {
	return (
		<PageWithFooter>
			<div className="min-h-full bg-background pt-16">
				<PlayersListView />
			</div>
		</PageWithFooter>
	);
}

