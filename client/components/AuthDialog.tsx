'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
	const [error, setError] = useState('');

	const handleSuccess = () => {
		onOpenChange(false);
		setError('');
		router.refresh();
	};

	const handleError = (errorMessage: string) => {
		setError(errorMessage);
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value as 'signin' | 'signup');
		setError('');
	};


	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-center text-2xl">
						{activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
					</DialogTitle>
				</DialogHeader>

				<div className="pt-2">
					{/* Error Message */}
					{error && (
						<div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
							{error}
						</div>
					)}


					{/* Tabs */}
					<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
						<TabsList className="grid w-full grid-cols-2 mb-6">
							<TabsTrigger value="signin">Sign In</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>

						<TabsContent value="signin">
							<SignInForm onSuccess={handleSuccess} onError={handleError} />
						</TabsContent>

						<TabsContent value="signup">
							<SignUpForm onSuccess={handleSuccess} onError={handleError} />
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}

