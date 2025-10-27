import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProfileView } from '@/components/profile/ProfileView';

interface ProfilePageProps {
	params: { username: string };
}

async function getProfile(username: string) {
	try {
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const url = `${serverUrl}/api/profile/${username}`;
		
		console.log('[Profile] Fetching profile from:', url);
		
		const response = await fetch(url, { cache: 'no-store' });

		console.log('[Profile] Response status:', response.status);

		if (!response.ok) {
			console.error('[Profile] Response not OK:', response.status, response.statusText);
			return null;
		}

		const data = await response.json();
		console.log('[Profile] Profile data received:', !!data);
		return data;
	} catch (error) {
		console.error('[Profile] Failed to fetch profile:', error);
		return null;
	}
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const session = await auth();
	const { username } = await params;
	const profileData = await getProfile(username);

	if (!profileData) {
		notFound();
	}

	const isOwnProfile = session?.user?.username === username || session?.user?.id === username;

	return (
		<div className="min-h-screen bg-background md:pt-16 pt-12">
			<ProfileView
				profileData={profileData}
				isOwnProfile={isOwnProfile}
				currentUser={session?.user}
			/>
		</div>
	);
}

