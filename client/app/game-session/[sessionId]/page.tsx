import { notFound } from 'next/navigation';
import { GameSessionView } from '@/components/game-session/GameSessionView';

interface GameSessionPageProps {
	params: { sessionId: string };
}

async function getGameSession(sessionId: string) {
	try {
		const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/game-sessions/sessions/${sessionId}`;
		const response = await fetch(url, { cache: 'no-store' });

		if (!response.ok) {
			return null;
		}

		return await response.json();
	} catch (error) {
		console.error('[GameSession] Failed to fetch game session:', error);
		return null;
	}
}

export default async function GameSessionPage({ params }: GameSessionPageProps) {
	const { sessionId } = await params;
	const sessionData = await getGameSession(sessionId);

	if (!sessionData) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background">
			<GameSessionView session={sessionData} />
		</div>
	);
}

