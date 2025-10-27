import { BlockchainWalletAuth } from '@/components/auth/BlockchainWalletAuth';
import { SignInForm } from '@/components/SignInForm';
import { SignUpForm } from '@/components/SignUpForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function SignInPage() {
	const session = await auth();
	
	if (session) {
		redirect('/');
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-bold">Welcome to W3P Platform</h1>
					<p className="text-muted-foreground mt-2">
						Connect your wallet or sign in with your account
					</p>
				</div>

				<Tabs defaultValue="wallet" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="wallet">Wallet</TabsTrigger>
						<TabsTrigger value="account">Account</TabsTrigger>
					</TabsList>
					
					<TabsContent value="wallet" className="space-y-4">
						<BlockchainWalletAuth />
					</TabsContent>
					
					<TabsContent value="account" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Sign In</CardTitle>
							</CardHeader>
							<CardContent>
								<SignInForm />
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader>
								<CardTitle>Create Account</CardTitle>
							</CardHeader>
							<CardContent>
								<SignUpForm />
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
