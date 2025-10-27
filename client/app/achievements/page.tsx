import { AchievementsView } from '@/components/achievements/AchievementsView';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function AchievementsPage() {
	return (
		<PageWithFooter>
			<div className="min-h-full bg-background pt-16">
				<div className="container mx-auto px-4 py-8 max-w-7xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
						<p className="text-muted-foreground mt-2">
							Unlock rewards by playing and improving your skills
						</p>
					</div>
					<AchievementsView />
				</div>
			</div>
		</PageWithFooter>
	);
}
