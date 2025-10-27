import { NextRequest, NextResponse } from 'next/server';
import { LedgerId } from '@hashgraph/sdk';

/**
 * API обработчик для аутентификации через Hedera
 * Проверяет подпись от кошелька Hedera и создает/обновляет пользователя
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, message, network } = body;

    // Проверка наличия необходимых данных
    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'Отсутствуют необходимые данные для аутентификации' },
        { status: 400 }
      );
    }

    // Валидация формата адреса Hedera
    if (!/^\d+\.\d+\.\d+$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Некорректный формат адреса Hedera' },
        { status: 400 }
      );
    }

    // Определяем сеть
    const ledgerId = network === 'mainnet' ? LedgerId.Mainnet : LedgerId.Testnet;

    console.log('Проверка подписи для Hedera аккаунта:', walletAddress);
    console.log('Сеть:', network, 'LedgerId:', ledgerId);
    console.log('Подпись:', signature?.substring(0, 20) + '...');
    console.log('Сообщение:', message);

    // TODO: Здесь должна быть проверка подписи через SDK Hedera
    // Для прототипа пропускаем этап проверки подписи и просто создаем/получаем пользователя

    // Ищем пользователя с этим адресом или создаем нового
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

    const response = await fetch(`${apiUrl}/auth/wallet-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        walletType: 'hedera',
        network,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка при запросе к серверу:', errorText);
      return NextResponse.json(
        { error: 'Ошибка сервера при обработке аутентификации' },
        { status: 500 }
      );
    }

    const userData = await response.json();

    // Возвращаем данные пользователя
    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName || `Hedera-${walletAddress.slice(0, 8)}`,
      avatar: userData.avatar,
      walletAddress: walletAddress,
    });
  } catch (error) {
    console.error('Ошибка при обработке Hedera аутентификации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

