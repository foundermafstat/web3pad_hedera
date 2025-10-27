import { GamesGalleryView } from '@/components/games/GamesGalleryView';
import { PageWithFooter } from '@/components/PageWithFooter';

export default function GamesPage() {
	return (
		<PageWithFooter>
			<div className="min-h-screen bg-background">
				<div className="container mx-auto py-8 max-w-7xl pt-16">
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight">Games</h1>
						<p className="text-muted-foreground mt-2">
							Discover exciting games controlled from your mobile device
						</p>
					</div>
					<GamesGalleryView />
				</div>
			</div>
		</PageWithFooter>
	);
}

