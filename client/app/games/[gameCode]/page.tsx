import { GameDetailView } from '@/components/games/GameDetailView';

interface GameDetailPageProps {
	params: Promise<{
		gameCode: string;
	}>;
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
	const { gameCode } = await params;
	
	return (
		<div className="min-h-screen bg-background">
			<GameDetailView gameCode={gameCode} />
		</div>
	);
}
