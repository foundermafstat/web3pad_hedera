# W3P — Web3Pad Hedera Gaming Platform

**Превратите любой экран в мгновенную мультиплеерную игровую арену с интеграцией блокчейна Hedera. Ваш смартфон — это ваш контроллер.**

Web3Pad Hedera Gaming Platform is a hybrid Web2/Web3 multiplayer gaming system designed for mass adoption — a native, simple, and social way for everyday people to step into Web3 through games with friends.

It bridges the gap between traditional entertainment and blockchain technology by turning any screen into a game hub and any smartphone into a controller. Players can instantly join arcade-style and party games via QR code, play together in real time, and earn blockchain-verified rewards without any prior Web3 knowledge.

No wallets, no setup, no installations — just fun that naturally leads to Web3.

Behind the scenes, Web3Pad integrates Hedera smart contracts for token rewards (HPLAY), NFT achievements, and fair gameplay validation. After each match, players can claim digital trophies, trade tokens, or join lotteries — all powered by the Hedera network.

---

## Содержание

- [Основные возможности](#-основные-возможности)
- [Launchpad-функциональность и переход Web2 → Web3](#-launchpad-функциональность-и-переход-web2--web3)

  - [Launchpad для игровых компаний](#-launchpad-для-игровых-компаний)
  - [Система контрактов Launchpad](#система-контрактов-launchpad)

- [Стратегия перехода Web2 → Web3](#-стратегия-перехода-web2--web3)
- [Быстрый старт](#-быстрый-старт)
- [Архитектура системы](#️-архитектура-системы)
- [Блокчейн интеграция](#️-блокчейн-интеграция)
- [Встроенные игры](#-встроенные-игры)
- [Смарт-контракты Hedera](#-смарт-контракты-hedera)
- [Error Handling](#-error-handling)
- [Smart-contracts Architecture](#-smart-contracts-architecture)
- [Token Economy Overview](#-token-economy)
- [Кошельки и авторизация](#-кошельки-и-авторизация)
- [API и интеграция контрактов](#-api-и-интеграция-контрактов)
- [Функции безопасности контрактов](#️-безопасность)
- [Технологический стек](#-технологический-стек)
- [Тестирование контрактов](#-тестирование)
- [Мониторинг](#-мониторинг)
- [Use Cases](#-use-cases)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Лицензия](#-лицензия)
- [Поддержка](#-поддержка)

---

## Основные возможности

Проект представляет собой полнофункциональную платформу для мультиплеерных игр с глубокой интеграцией блокчейна Hedera, включая токены, NFT, лотерею и систему достижений.

**Нулевая настройка** — никаких приложений для установки. Всё работает прямо в браузере.
**Телефон = контроллер** — отсканируйте QR-код, и ваш телефон мгновенно становится геймпадом.
**Локальная сеть** — ультранизкая задержка: ваши данные не покидают вашу сеть.
**До 10 игроков** — идеально для вечеринок, тимбилдинга и семейных игровых вечеров.
**Красивая графика** — работает на PixiJS v8 для плавного 60 FPS-геймплея.

---

## Launchpad-функциональность и переход Web2 → Web3

### Launchpad для игровых компаний

W3P также выполняет роль **Launchpad-платформы**, предоставляя игровым компаниям инструменты для внедрения Web3 через смарт-контракт **HederaGameLaunchpad** — главный оркестратор экосистемы.

**Основные функции:**

1. **Регистрация игр** — `registerGameModule()`
2. **Верификация результатов** — `submitGameResult()`
3. **Игровая идентичность (SBT)** — `mintPlayerSBT()`
4. **NFT-достижения** — `mintAchievementNFT()`
5. **Токен-экономика** — `swapHBARforHPLAY()`
6. **Лотерея** — `executeLotteryDraw()`

---

### Система контрактов Launchpad (Core Contract System)

| Контракт                | Назначение                                |
| ----------------------- | ----------------------------------------- |
| **HederaGameLaunchpad** | Главный оркестратор                       |
| **GameRegistry**        | Регистрация и авторизация игровых модулей |
| **ResultVerifier**      | Проверка результатов                      |
| **PlayerSBT**           | SoulBound-токены игроков                  |
| **NFTManager**          | Управление NFT-достижениями               |
| **TokenEconomy**        | HPLAY-токен и стейкинг                    |
| **FaucetManager**       | Конвертация HBAR → HPLAY                  |
| **LotteryPool**         | Лотерея, финансируемая комиссиями         |

---

## Стратегия перехода Web2 → Web3

W3P упрощает интеграцию Web3-функций в традиционные Web2-игры, не требуя полной переработки логики.

### Фазы интеграции:

1. **Создание игры (Off-chain)** — логика и физика выполняются на сервере.
2. **Регистрация сессии (On-chain)** — запись данных о матчах в Hedera.
3. **Верификация результатов (Гибрид)** — подпись сервером, проверка на блокчейне.
4. **NFT-достижения (On-chain)** — чеканка NFT с метаданными достижений.

### Бесшовная авторизация

- Вход через **email/OAuth** (Google, GitHub)
- Поддержка **HashPack**, **Blade**, **WalletConnect**
- Автоматическое создание аккаунтов (`hedera_0_0_xxx`)

---

## Быстрый старт

### Предварительные требования

- Node.js 18+
- npm или pnpm
- Аккаунт Hedera Testnet с HBAR (для блокчейн функций)

### Установка

1. **Клонируйте репозиторий:**

```bash
git clone https://github.com/foundermafstat/web3pad_hedera.git
cd web3pad_hedera
```

2. **Установите зависимости:**

```bash
pnpm install
```

3. **Настройте переменные окружения:**

Скопируйте файл примера и заполните значения:

```bash
cp .env.example .env
```

**Серверные переменные:**

```env
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api
DATABASE_URL=postgresql://username:password@localhost:5432/w3p_db
JWT_SECRET=your_jwt_secret_here
```

**Клиентские переменные:**

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. **Запустите сервер разработки:**

```bash
# Запустить сервер (порт 3001)
cd server
pnpm install
node server.js

# В новом терминале - запустить клиент (порт 3000)
cd client
pnpm install
pnpm run dev
```

5. **Запустите проект локально:**

```bash
pnpm start
# or for development
pnpm dev
```

---

## Архитектура системы

### Обзор компонентов

The platform is built on a three-tier architecture that clearly separates the presentation layer (Next.js client), application logic (Express.js server with Socket.IO), and data persistence (PostgreSQL and Hedera blockchain). This architecture powers a hybrid Web2/Web3 gaming system where traditional multiplayer gameplay runs on centralized servers, while player rewards, the token economy, and achievements are securely managed on the Hedera Hashgraph blockchain.

### Core Technologies

The platform is built on the following core technologies:

| **Layer**          | **Technology**             | **Key Dependencies**                                                         |
| ------------------ | -------------------------- | ---------------------------------------------------------------------------- |
| **Client**         | Next.js 16 (App Router)    | `react`, `next-auth`, `@hashgraph/hedera-wallet-connect`, `socket.io-client` |
| **Server**         | Express.js + Socket.IO     | `express@4.18.2`, `socket.io@4.7.5`, `@hashgraph/sdk@2.50.0`                 |
| **Database**       | PostgreSQL + Prisma        | `@prisma/client@6.1.0`, `prisma@6.1.0`                                       |
| **Blockchain**     | Hedera Hashgraph (Testnet) | `@hashgraph/sdk`, `ethers@6.13.2`                                            |
| **Authentication** | NextAuth.js                | `next-auth, jsonwebtoken@9.0.2, bcryptjs@2.4.3`                              |


```
├── client/                    # Next.js фронтенд приложение
│   ├── app/                   # Next.js App Router страницы
│   ├── components/            # React компоненты
│   ├── contexts/              # React контексты (WalletContext)
│   ├── lib/                   # Утилиты (HederaService, API клиенты)
│   └── hooks/                 # Пользовательские React hooks
│
├── server/                    # Node.js + Express бэкенд
│   └── docs/
│    	└── contract-api.md          # API documentation
│   ├── games/                 # Игровая логика
│   ├── lib/
│   	├── hedera-config.js          # Hedera client configuration
│   	├── contract-service.js       # Contract interaction service
│   	└── contract-error-handler.js # Enhanced error handling
│		├── middleware/
│   	└── contract-middleware.js   # API middleware
│   └── prisma/                # База данных и схемы
│   ├── routes/                # API routes
│   	└── contracts.js             # API routes
│		├── scripts/
│
└── contracts/                 # Hedera смарт-контракты
    ├── core/                  # Solidity контракты
    ├── scripts/               # Скрипты развертывания
    └── test/                  # Тесты контрактов
```

### Key Architectural Patterns:

| **Component**                      | **Description**                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client-Side Wallet Integration** | The `HederaService` singleton (`client/lib/hedera.ts`, lines 23–584) manages WalletConnect sessions using the `@hashgraph/hedera-wallet-connect` `DAppConnector` class, enabling direct wallet-to-blockchain communication for transaction signing.                                                                                                      |
| **Dual Service Architecture**      | The backend implements two dedicated blockchain interaction services: <br>• **ContractService** (`server/lib/contract-service.js`, lines 9–667): Handles read-only queries via `ContractCallQuery` and `ethers.Contract`. <br>• **TransactionService** (`server/lib/transaction-service.js`): Handles write operations via `ContractExecuteTransaction`. |
| **Hybrid API Routing**             | Next.js API routes serve as authenticated gateways to the Express backend. Some routes proxy to Express (e.g., `client/app/api/swap`), while others are processed directly on the client side.                                                                                                                                                           |
| **Socket.IO Real-Time Layer**      | Game state synchronization is managed via bidirectional Socket.IO events handled by the `GameRoomManager`.                                                                                                                                                                                                                                           |

![Архитектура проекта](./client/public/schemas/architecture.png)

### Request Flow Architecture
The following diagram illustrates the complete request flow for critical operations, showing the path from user interaction to blockchain state change.

### Token Swap Request Flow: 

![Token swap](./client/public/schemas/token-swap.png)

This flow demonstrates the critical security pattern where:
1. Server creates unsigned transactions with user as payer (server/lib/transaction-service.js)
2. Client obtains signature from user's wallet (client/components/swap/SwapInterface.tsx)
3. Server executes the pre-signed transaction (server/routes/swap.js)

### Authentication Architecture
The platform supports several authentication methods through NextAuth.js configuration, each with distinct provider implementations.

Authentication Flow Implementation:
1. Credentials Authentication (client/lib/auth.config.ts): Uses bcryptjs to hash passwords and validates against User.password field in PostgreSQL.

2. OAuth Authentication (client/lib/auth.config.ts): The signIn callback intercepts OAuth providers (Google, GitHub) and synchronizes user data to the backend via /api/auth/oauth endpoint (server/routes/auth.js).

3. Wallet Authentication - Two separate flows:

- Blockchain (Leather) (client/lib/auth.config.ts): Validates EVM wallet addresses using isValidBlockchainAddress() function
- Hedera (client/lib/auth.config.ts): Validates Hedera address format \d+\.\d+\.\d+ using isValidHederaAddress() function
4. Session Management (client/lib/auth.config.ts): JWT tokens store userId, username, wallets[] array, and displayName which are populated into the NextAuth session object.

### Smart Contract Integration 
The platform interfaces with eight deployed Hedera smart contracts through a dual-approach pattern using both Hedera SDK and Ethers.js JSON-RPC.

#### Contract Service Architecture:
--

### Adding New Contract Functions

1. Add function to `contract-service.js`
2. Add corresponding API endpoint in `routes/contracts.js`
3. Update API documentation
4. Add test case to `test-contracts.js`

### Testing

```bash
# Run integration tests
node scripts/test-contracts.js

# Test specific endpoint
curl -X GET "http://localhost:3001/api/contracts/system/stats"
```

## Блокчейн интеграция

Платформа интегрируется с Hedera Hashgraph через несколько ключевых компонентов:

**Серверная интеграция:**

- `ContractService` - Операции чтения из смарт-контрактов
- `TransactionService` - Операции записи и выполнение транзакций
- Двойной подход: Hedera SDK для простых запросов, JSON-RPC для сложных возвратов

**Клиентская интеграция:**

- `HederaService` - Singleton сервис для операций с кошельками Hedera
- `WalletContext` - React контекст для глобального состояния кошелька
- Поддержка трех методов подключения: WalletConnect, HashPack, Blade

**Ключевые компоненты:**

- `ContractService` — взаимодействие с контрактами
- `TransactionService` — выполнение транзакций
- `WalletContext` — глобальное состояние кошелька
- `HederaService` — API для операций с Hedera

---

## Встроенные игры

| Игра              | Жанр         | Игроков | Описание                            |
| ----------------- | ------------ | ------- | ----------------------------------- |
| **Battle Arena**  | Шутер сверху | 2–10    | PvE-экшен с AI-ботами               |
| **Race Track**    | Гонки        | 2–10    | Реальные гонки с чекпоинтами        |
| **Tower Defence** | Стратегия    | 1–4     | Кооп-защита базы от волн врагов     |
| **Quiz Game**     | Викторина    | 2–10    | Интерактивная интеллектуальная игра |

---

## Смарт-контракты Hedera

This integration provides server-side access to Hedera smart contracts deployed on the testnet.
Всего развернуто 9 смарт-контрактов:
| Контракт | Адрес | Назначение |
| ------------------- | -------------------------------------------- | -------------------- |
| GameRegistry | `0xda0cbeae027b044648386e4c27e20c18257c885a` | Регистрация игр |
| TokenEconomy | `0x23f6bb3a2c8babee952e0443b6b7350aa85d6ab9` | HPLAY токен |
| LotteryPool | `0x9bb862643a73725e636dd7d7e30306844aa099f3` | Лотерея |
| PlayerSBT | `0xfe9CF4dde9fBc14d61D26703354AA10414B35Ea6` | SoulBound токены |
| NFTManager | `0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860` | NFT достижения |
| FaucetManager | `0xee9e9daf635aadcbe7725faae73f6d38f66cfb3a` | Faucet система |
| ResultVerifier | `0xb1583369fe74fbf2d9b87b870fe67d6d0dc13b84` | Проверка результатов |
| HederaGameLaunchpad | `0x54d13a05c632738674558f18de4394b7ee9a0399` | Главный контракт |

---

## Error Handling

All endpoints return standardized error responses:

```json
{
    "success": false,
    "error": "Error message",
    "type": "ERROR_TYPE",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Types

- `VALIDATION_ERROR`: Invalid input parameters
- `CONTRACT_CALL_FAILED`: Contract function call failed
- `INVALID_CONTRACT_ADDRESS`: Invalid contract address
- `INSUFFICIENT_BALANCE`: Insufficient balance for operation
- `UNAUTHORIZED`: Unauthorized access
- `NOT_FOUND`: Resource not found
- `BLOCKCHAIN_ERROR`: Blockchain service error
- `RATE_LIMIT_EXCEEDED`: Too many requests

### Rate Limiting

- **Limit**: 50 requests per minute per IP address
- **Headers**: Rate limit information included in responses
- **Retry-After**: Header provided when limit exceeded

---

## Smart-contracts Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   Express API    │───▶│  Contract       │
│                 │    │   /api/contracts │    │  Service        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                         │
                                ▼                         ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Error Handler   │    │  Hedera SDK     │
                       │  & Validation    │    │  Client         │
                       └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Hedera Testnet  │
                                                │ Smart Contracts │
                                                └─────────────────┘
```
---

## Troubleshooting

### Common Issues

1. **"Contract call failed"**: Check if Hedera account has sufficient HBAR
2. **"Invalid contract address"**: Verify contract addresses in configuration
3. **"Rate limit exceeded"**: Wait before making more requests
4. **"Validation error"**: Check input parameters format

### Debug Mode

Enable debug logging by setting environment variable:

```env
DEBUG=contracts:*
```

### Logs

All contract interactions are logged with timestamps and error details. Check server console for detailed information.

## Security Considerations

- ✅ Input validation on all parameters
- ✅ Rate limiting to prevent abuse
- ✅ Error handling without exposing sensitive data
- ✅ Read-only operations (no write access)
- ✅ Hedera account isolation

---

## Token Economy Overview

The HBAR-to-HPLAY token swap system is the highest-importance feature (importance 9.91). Users exchange native HBAR for the platform's HPLAY token through the FaucetManager smart contract, with swap rates and daily limits enforced on-chain.

- **Токен:** Hedera Play Token (HPLAY)
- **Decimals:** 8
- **Объем:** 10 000 000 000 HPLAY

**Распределение:**

- 40% — Пул наград игрокам
- 20% — Стимулы разработчикам
- 20% — DAO-казна
- 10% — Маркетинговые события
- 10% — Резерв ликвидности

**NFT-достижения:**

- Common — 10 HPLAY
- Rare — 50 HPLAY
- Epic — 200 HPLAY
- Legendary — 1000 HPLAY

![Token Economy](./client/public/schemas/token.png)
---

## Кошельки и авторизация

Поддержка: **WalletConnect**, **HashPack**, **Blade**

- Подпись транзакций на клиенте
- Автоматическое восстановление сессий
- Mainnet/Testnet совместимость

---

### Провайдеры Hedera кошельков

Поддерживаются три метода подключения с автоматическим переключением:

1. **WalletConnect** - Кросс-платформенное подключение мобильных кошельков через сканирование QR-кода
2. **HashPack** - Расширение браузера с прямой интеграцией
3. **Blade** - Расширение браузера с прямой интеграцией

---

### Глобальное состояние кошелька

`WalletContext` предоставляет глобальное состояние кошелька во всем приложении:

**Основные свойства состояния:**

- `isConnected` - Подключен ли кошелек
- `walletAddress` - Адрес подключенного кошелька
- `walletType` - Используемый метод подключения
- `network` - Активная сеть (mainnet/testnet)
- `dAppConnector` - Экземпляр WalletConnect DAppConnector
- `currentSession` - Активная WalletConnect сессия

---

## API и интеграция контрактов

## API интеграция контрактов

The integration provides REST API endpoints under `/api/contracts/`:

### System Information
- `GET /api/contracts/system/stats` - Get system statistics
- `GET /api/contracts/system/operational` - Check system status

### Player Data
- `GET /api/contracts/player/:address/info` - Get comprehensive player info
- `GET /api/contracts/player/:address/stats` - Get player statistics
- `GET /api/contracts/player/:address/sbt` - Check SBT status
- `GET /api/contracts/player/:address/nft-count` - Get NFT count

### Token Economy
- `GET /api/contracts/token/balance/:address` - Get token balance
- `GET /api/contracts/token/supply` - Get total supply
- `GET /api/contracts/token/staked/:address` - Get staked balance

### Game Information
- `GET /api/contracts/games/:gameId/info` - Get game module info
- `GET /api/contracts/games/:gameId/difficulty` - Get difficulty multiplier
- `GET /api/contracts/games/total` - Get total games count

### Lottery System
- `GET /api/contracts/lottery/pool-balance` - Get pool balance
- `GET /api/contracts/lottery/participants` - Get participants count
- `GET /api/contracts/lottery/next-draw` - Get time until next draw

### Faucet System
- `GET /api/contracts/faucet/swap-rate` - Get swap rate info
- `GET /api/contracts/faucet/user/:address` - Get user swap info

### Reward Calculation
- `POST /api/contracts/rewards/calculate` - Calculate reward amount

## Usage Examples

### JavaScript/TypeScript

```javascript
// Get player information
const response = await fetch('/api/contracts/player/0x123.../info');
const data = await response.json();

if (data.success) {
    console.log('Player has SBT:', data.data.hasSBT);
    console.log('Games played:', data.data.stats.totalGamesPlayed);
}

// Calculate reward
const rewardResponse = await fetch('/api/contracts/rewards/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: 1500, gameId: 'shooter-game' })
});
const rewardData = await rewardResponse.json();
```

### cURL

```bash
# Get system stats
curl -X GET "http://localhost:3001/api/contracts/system/stats"

# Get player info
curl -X GET "http://localhost:3001/api/contracts/player/0x123.../info"

# Calculate reward
curl -X POST "http://localhost:3001/api/contracts/rewards/calculate" \
  -H "Content-Type: application/json" \
  -d '{"score": 1500, "gameId": "shooter-game"}'
```

---

### Функции безопасности контрактов

- **Ролевой контроль доступа:** Owner, DAO, Server и Game Server роли
- **Защита от реентрантности:** Все внешние вызовы защищены
- **Верификация подписей:** ECDSA подписи с защитой от повторного воспроизведения
- **Валидация Nonce:** Монотонная система nonce предотвращает повторные атаки
- **Валидация временных меток:** Истечение срока действия подписей
- **Функция паузы:** Аварийная пауза для всех контрактов
- **Валидация входных данных:** Комплексная проверка параметров

---

### Подпись транзакций на стороне клиента

Платформа реализует паттерн **подписи на стороне клиента**, где пользователи подписывают транзакции своими кошельками, обеспечивая хранение приватных ключей.

Процесс включает:

1. Создание транзакции на сервере
2. Заморозка транзакции с пользователем как плательщиком
3. Подпись пользователем через WalletConnect/HashPack/Blade
4. Отправка подписанной транзакции на выполнение

---

## Технологический стек

**Backend:**

- Node.js - Среда выполнения
- Express - Веб-сервер фреймворк
- Socket.io - Двунаправленная коммуникация в реальном времени
- Hedera SDK - Интеграция с блокчейном Hedera
- Prisma - ORM для базы данных
- PostgreSQL - Реляционная база данных

**Frontend:**

- Next.js 16 - React фреймворк с App Router
- React 19 - UI библиотека
- TypeScript - Типизация
- TailwindCSS 4 - Utility-first стилизация
- NextAuth - Аутентификация и управление сессиями

**Game Engine:**

- PixiJS v8 - Высокопроизводительный 2D WebGL рендеринг
- 60 FPS игровой цикл с delta time расчетами

**Блокчейн:**

- Hedera Hashgraph - Testnet
- Solidity - Язык смарт-контрактов
- Hardhat - Разработка и тестирование контрактов
- ethers.js - Взаимодействие с контрактами

---

## Тестирование контрактов

### Тестирование контрактов

```bash
cd contracts
pnpm test                    # Запустить все тесты
pnpm run test:coverage       # Запустить с покрытием
```

Набор тестов включает:

- **Unit тесты:** Функциональность отдельных контрактов
- **Интеграционные тесты:** Взаимодействие между контрактами
- **Тесты безопасности:** Контроль доступа и валидация
- **Gas тесты:** Верификация оптимизации

### Тестирование интеграции

```bash
# Тест взаимодействия с контрактами
node server/scripts/test-contracts.js

# Быстрые тесты
pnpm run test:fast
```

---

## Мониторинг

### Ключевые метрики

- Всего сыгранных игр
- Активных игроков
- Распределено HPLAY
- Баланс лотерейного пула
- Отчеканено NFT
- Статус здоровья системы

### События

Все основные операции генерируют события для мониторинга:

```solidity
event GameResultVerified(address indexed player, string indexed gameId, uint256 score);
event PlayerSBTMinted(address indexed player, uint256 tokenId);
event NFTMinted(address indexed player, uint256 tokenId, string achievementType);
event LotteryWinner(address indexed winner, uint256 prizeAmount);
```

---

## Use Cases

**Идеально для:**

- **Домашних вечеринок** - мгновенное развлечение для гостей
- **Корпоративных мероприятий** - командообразующие активности
- **Семейных встреч** - развлечение для всех возрастов
- **Площадок для мероприятий** - интерактивные игровые зоны
- **Школ** - образовательные игровые сессии
- **Игровых кафе** - не требуется обслуживание контроллеров

---

## Roadmap

**Скоро:**

- Больше типов игр (пазлы, платформеры, файтинги)
- Пользовательские игровые комнаты с паролями
- Профили игроков и статистика
- Система воспроизведения
- Режим зрителя
- Турнирные сетки
- Пользовательские скины и темы
- Кросс-игровая совместимость
- Интеграция Layer-2 масштабирования
- Децентрализованная генерация случайных чисел
- Реализация токена управления

---

## Contributing

Приветствуются:

- Добавление новых игр
- Исправление ошибок
- Улучшение документации
- Улучшение UI/UX

Не стесняйтесь открывать issues и pull requests.

---

## Поддержка

**Если у вас возникли вопросы, предложения или проблемы:**

- Создайте issue в репозитории
- Ознакомьтесь с документацией
- Изучите тест-кейсы для примеров использования

**Свяжитесь с нами в соцсетях:**

**Ihor Sokolov:**

- 💬 [Telegram](https://t.me/iampublion)
- 🐦 [Twitter](https://x.com/ampublion)
- 🌐 [Linkedin](https://linkedin.com/in/mafstat)

**Irina Semichasova:**

- 💬 [Telegram](https://t.me/irine7)
- 🐦 [Twitter](https://x.com/irine_es)
- 🌐 [Linkedin](https://linkedin.com/in/irina-semichasova)

---

## Лицензия

**Copyright © 2025 Ihor Sokolov (foundermafstat) & Irina Semichasova (Irine7), Web3Pad Team (All Rights Reserved)**
