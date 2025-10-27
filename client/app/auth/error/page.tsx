'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  GitHubEmailPrivate: 'GitHub login failed because your email is private. Please make your email public in GitHub settings or use a different sign-in method.',
  OAuthServerError: 'There was a problem communicating with our server during authentication.',
  OAuthProcessError: 'An error occurred while processing your authentication data.',
  Default: 'An error occurred during authentication.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') as keyof typeof errorMessages;

  // Получаем дополнительные параметры ошибки
  const provider = searchParams.get('provider');
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {errorMessages[error] || errorMessages.Default}
          </p>
          
          {error && (
            <div className="bg-muted p-3 rounded-md space-y-1">
              <p className="text-sm font-mono">Error: {error}</p>
              {provider && <p className="text-sm font-mono">Provider: {provider}</p>}
              {status && <p className="text-sm font-mono">Status: {status}</p>}
              {message && <p className="text-sm font-mono break-all">Message: {message}</p>}
            </div>
          )}
          
          {error === 'GitHubEmailPrivate' && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 p-3 rounded-md text-sm">
              <p className="font-medium mb-2">How to fix:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <a href="https://github.com/settings/emails" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">GitHub Email Settings</a></li>
                <li>Check "Keep my email addresses private"</li>
                <li>Make sure you have verified your email address</li>
                <li>Return here and try signing in again</li>
              </ol>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
