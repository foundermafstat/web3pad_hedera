import { BlockchainWalletAuth } from '@/components/auth/BlockchainWalletAuth';
import { HederaWalletAuth } from '@/components/auth/HederaWalletAuth';
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

				<Tabs defaultValue="hedera" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="hedera">Hedera</TabsTrigger>
						<TabsTrigger value="wallet">Bitcoin</TabsTrigger>
						<TabsTrigger value="account">Account</TabsTrigger>
					</TabsList>
					
					<TabsContent value="hedera" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Hedera Wallet</CardTitle>
							</CardHeader>
							<CardContent>
								<HederaWalletAuth />
							</CardContent>
						</Card>
					</TabsContent>
					
					<TabsContent value="wallet" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Bitcoin Wallet</CardTitle>
							</CardHeader>
							<CardContent>
								<BlockchainWalletAuth />
							</CardContent>
						</Card>
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
