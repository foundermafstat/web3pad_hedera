import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Логирование запроса для отладки
  console.log('DEBUG GitHub Auth - Request URL:', req.url);
  console.log('DEBUG GitHub Auth - Headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    // Прочитаем параметры запроса
    const params = Object.fromEntries(new URL(req.url).searchParams.entries());
    console.log('DEBUG GitHub Auth - Query params:', params);
    
    return NextResponse.json({ 
      message: 'GitHub Auth Debug Route',
      params,
      env: {
        githubClientIdSet: !!process.env.GITHUB_CLIENT_ID,
        githubClientSecretSet: !!process.env.GITHUB_CLIENT_SECRET,
        nextAuthUrlSet: !!process.env.NEXTAUTH_URL,
        nextAuthSecretSet: !!process.env.NEXTAUTH_SECRET,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      }
    });
  } catch (error) {
    console.error('DEBUG GitHub Auth Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
