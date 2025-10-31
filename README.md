# W3P — Web3Pad Hedera Gaming Platform

**Turn any screen into an instant multiplayer arena with Hedera blockchain integration. Your smartphone is your controller.**

Web3Pad Hedera Gaming Platform is a hybrid Web2/Web3 multiplayer gaming system built for mass adoption — a native, simple, and social way for everyday users to step into Web3 through games with friends.

It bridges the gap between traditional entertainment and blockchain technology by transforming any screen into a game hub and any smartphone into a controller. Players can instantly join arcade-style and party games via QR code, play together in real time, and earn blockchain-verified rewards — all without prior Web3 experience.

No wallets, no setup, no installations — just fun that naturally leads to Web3.

Behind the scenes, Web3Pad integrates Hedera smart contracts for token rewards (HPLAY), NFT achievements, and fair gameplay validation. After each match, players can claim digital trophies, trade tokens, or join lotteries — all powered by the Hedera network.

---

Track 3: Gaming & NFTs | Quest 1: THG Identity Platform

Pitch deck link: https://pitch.com/v/web3pad-pitch-deck-bcp98n

Certification: Assessment ID A08X3SQYD1A1

![Certification](./client/public/schemas/certification.jpg)

---

## Table of Contents

- [Key Features](#key-features)
- [Launchpad Functionality and Web2 → Web3 Transition](#launchpad-functionality-and-web2--web3-transition)
  - [Launchpad for Game Studios](#launchpad-for-game-studios)
  - [Launchpad Contract System](#launchpad-contract-system-core-contract-system)
- [Web2 → Web3 Transition Strategy](#web2--web3-transition-strategy)
  - [Integration Phases](#integration-phases)
  - [Seamless Authentication](#seamless-authentication)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [System Architecture](#system-architecture)
  - [Component Overview](#component-overview)
  - [Core Technologies](#core-technologies)
  - [Key Architectural Patterns](#key-architectural-patterns)
  - [Request Flow Architecture](#request-flow-architecture)
  - [Token Swap Request Flow](#token-swap-request-flow)
  - [Authentication Architecture](#authentication-architecture)
  - [Smart Contract Integration](#smart-contract-integration)
  - [Real-Time Gaming Architecture](#real-time-gaming-architecture)
  - [Adding New Contract Functions](#adding-new-contract-functions)
  - [Testing](#testing)
- [Blockchain Integration](#blockchain-integration)
  - [Network Configuration](#network-configuration)
  - [SDK Initialization Patterns](#sdk-initialization-patterns)
- [Built-in Games](#built-in-games)
- [Hedera Smart Contracts](#hedera-smart-contracts)
- [Error Handling](#error-handling)
  - [Error Types](#error-types)
  - [Rate Limiting](#rate-limiting)
- [Smart-contracts Architecture](#smart-contracts-architecture)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Debug Mode](#debug-mode)
  - [Logs](#logs)
- [Security Considerations](#security-considerations)
- [Token Economy Overview](#token-economy-overview)
  - [Token Architecture](#token-architecture)
  - [HPLAY Token Properties](#hplay-token-properties)
  - [Token Distribution Model](#token-distribution-model)
  - [Token Acquisition Mechanisms](#token-acquisition-mechanisms)
  - [Reward Mechanisms](#reward-mechanisms)
  - [Integration with Platform Systems](#integration-with-platform-systems)
  - [Security Considerations (Token Economy)](#security-considerations-1)
- [Wallets and Authentication](#wallets-and-authentication)
  - [Hedera Wallet Providers](#hedera-wallet-providers)
  - [Global Wallet State](#global-wallet-state)
- [API and Contract Integration](#api-and-contract-integration)
  - [Contract API Integration](#contract-api-integration)
    - [System Information](#system-information)
    - [Player Data](#player-data)
    - [Token Economy](#token-economy)
    - [Game Information](#game-information)
    - [Lottery System](#lottery-system)
    - [Faucet System](#faucet-system)
    - [Reward Calculation](#reward-calculation)
- [Usage Examples](#usage-examples)
  - [JavaScript/TypeScript](#javascripttypescript)
  - [cURL](#curl)
  - [Smart Contract Security Features](#smart-contract-security-features)
  - [Client-Side Transaction Signing](#client-side-transaction-signing)
- [Tech Stack](#tech-stack)
- [Contract Testing](#contract-testing)
  - [Contract Tests](#contract-tests)
  - [Integration Testing](#integration-testing)
- [Monitoring](#monitoring)
  - [Key Metrics](#key-metrics)
  - [Events](#events)
- [Use Cases](#use-cases)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

---

## Key Features

The project is a fully functional multiplayer gaming platform with deep integration of the **Hedera blockchain**, including tokens, NFTs, lottery mechanics, and an achievement system.

**Zero setup** — no apps to install. Everything runs directly in the browser.
**Phone = Controller** — scan a QR code and your phone instantly becomes a gamepad.
**Local network** — ultra-low latency: your data never leaves your network.
**Up to 10 players** — perfect for parties, team-building events, and family game nights.
**Beautiful graphics** — powered by **PixiJS v8** for smooth 60 FPS gameplay.

---

## Launchpad Functionality and Web2 → Web3 Transition

### Launchpad for Game Studios

W3P also serves as a **Launchpad platform**, providing game developers with tools to onboard into Web3 through the **HederaGameLaunchpad** smart contract — the main orchestrator of the ecosystem.

**Core Functions:**

1. **Game Registration** — `registerGameModule()`
2. **Result Verification** — `submitGameResult()`
3. **Player Identity (SBT)** — `mintPlayerSBT()`
4. **NFT Achievements** — `mintAchievementNFT()`
5. **Token Economy** — `swapHBARforHPLAY()`
6. **Lottery System** — `executeLotteryDraw()`

---

### Launchpad Contract System (Core Contract System)

| **Contract**            | **Purpose**                                    |
| ----------------------- | ---------------------------------------------- |
| **HederaGameLaunchpad** | Main orchestrator                              |
| **GameRegistry**        | Registration and authorization of game modules |
| **ResultVerifier**      | Result verification                            |
| **PlayerSBT**           | Player SoulBound Tokens                        |
| **NFTManager**          | NFT achievement management                     |
| **TokenEconomy**        | HPLAY token and staking system                 |
| **FaucetManager**       | HBAR → HPLAY conversion                        |
| **LotteryPool**         | Lottery funded by commission fees              |

---

## Web2 → Web3 Transition Strategy

W3P simplifies the integration of Web3 features into traditional Web2 games without requiring a complete redesign of the existing logic.

### Integration Phases:

1. **Game Creation (Off-chain)** — game logic and physics are executed on the server.
2. **Session Registration (On-chain)** — match data is recorded on Hedera.
3. **Result Verification (Hybrid)** — signed by the server and validated on-chain.
4. **NFT Achievements (On-chain)** — minting NFTs with embedded achievement metadata.

### Seamless Authentication

- Sign in via **Email/OAuth** (Google, GitHub)
- Support for **HashPack**, **Blade**, **WalletConnect**
- Automatic account creation (`hedera_0_0_xxx`)

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- A **Hedera Testnet account** with HBAR (for blockchain functionality)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/foundermafstat/web3pad_hedera.git
cd web3pad_hedera
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

Copy the example file and fill in the required values:

```bash
cp .env.example .env
```

**Server environment variables:**

```env
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api
DATABASE_URL=postgresql://username:password@localhost:5432/w3p_db
JWT_SECRET=your_jwt_secret_here
```

**Client environment variables:**

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. **Run the development servers:**

```bash
# Start the backend (port 3001)
cd server
pnpm install
node server.js

# In a new terminal — start the frontend (port 3000)
cd client
pnpm install
pnpm run dev
```

5. **Run the project locally:**

```bash
pnpm start
# or for development
pnpm dev
```

---

## System Architecture

### Component Overview

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
├── client/                    # Next.js frontend application
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── contexts/              # React contexts (WalletContext)
│   ├── lib/                   # Utilities (HederaService, API clients)
│   └── hooks/                 # Custom React hooks
│
├── server/                    # Node.js + Express backend
│   └── docs/
│       └── contract-api.md          # API documentation
│   ├── games/                 # Game logic
│   ├── lib/
│       ├── hedera-config.js          # Hedera client configuration
│       ├── contract-service.js       # Contract interaction service
│       └── contract-error-handler.js # Enhanced error handling
│   ├── middleware/
│       └── contract-middleware.js    # API middleware
│   └── prisma/                # Database and schemas
│   ├── routes/                # API routes
│       └── contracts.js             # API routes
│   ├── scripts/
│
└── contracts/                 # Hedera smart contracts
    ├── core/                  # Solidity contracts
    ├── scripts/               # Deployment scripts
    └── test/                  # Contract tests
```

### Key Architectural Patterns:

| **Component**                      | **Description**                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client-Side Wallet Integration** | The `HederaService` singleton (`client/lib/hedera.ts`, lines 23–584) manages WalletConnect sessions using the `@hashgraph/hedera-wallet-connect` `DAppConnector` class, enabling direct wallet-to-blockchain communication for transaction signing.                                                                                                      |
| **Dual Service Architecture**      | The backend implements two dedicated blockchain interaction services: <br>• **ContractService** (`server/lib/contract-service.js`, lines 9–667): Handles read-only queries via `ContractCallQuery` and `ethers.Contract`. <br>• **TransactionService** (`server/lib/transaction-service.js`): Handles write operations via `ContractExecuteTransaction`. |
| **Hybrid API Routing**             | Next.js API routes serve as authenticated gateways to the Express backend. Some routes proxy to Express (e.g., `client/app/api/swap`), while others are processed directly on the client side.                                                                                                                                                           |
| **Socket.IO Real-Time Layer**      | Game state synchronization is managed via bidirectional Socket.IO events handled by the `GameRoomManager`.                                                                                                                                                                                                                                               |

![Architecture](./client/public/schemas/architecture.png)

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

Key Integration Patterns:

1. Contract Address Management: All contract addresses are centralized in CONTRACT_ADDRESSES object (
   server/lib/hedera-config.js) with Hedera format (0.0.x) which is converted to EVM format (0x...) using getContractEvmAddress() function (
   server/lib/hedera-config.js).
2. Dual Query Approach: ContractService implements both methods for resilience:

- SDK Method: Uses ContractCallQuery (server/lib/contract-service.js) for standard read operations
- JSON-RPC Method: Uses ethers.Contract (server/lib/contract-service.js) via getEthersContract() for complex return types like arrays

3. Mock Fallback System: When HEDERA_USE_MOCKS=true, the getMockContractResult() function (server/lib/contract-service.js) returns predefined data, enabling development without live blockchain connectivity.

4. Gas and Payment Configuration: All contract calls use standardized limits:

- Read queries: setGas(500000), setMaxQueryPayment(Hbar.fromTinybars(200000000)) (server/lib/contract-service.js)
- Write transactions: Configurable via options parameter (server/lib/transaction-service.js)

### Real-Time Gaming Architecture

The gaming system uses Socket.IO for bidirectional real-time communication between game screens (display devices) and controllers (mobile devices).

#### Socket.IO Event Flow

#### Key Socket.IO Patterns

Room Creation Flow:

`server/server.js` (lines 121–155)

- **Event:** `createRoom` or `game:create`
- Creates game instance via `roomManager.createRoom(roomId, gameType, config)`
- Stores socket in `room.sockets` `Set`
- Maps `socket.id` to `roomId` in `playerToRoom` `Map`

Player Join Flow:

`server/server.js` (lines 158–184)

- **Event:** `joinRoom`, `shooter:auth`, or `controller:join`
- Validates password if room has one
- Calls `roomManager.joinRoom(roomId, socket, playerName, walletAddress)`
- Broadcasts `playerConnected` to all room sockets

Input Handling:

`server/server.js` (lines 204–235)

- **Events:** `playerInput`, `shooter:input`, `controller:gyro`
- Looks up room via `playerToRoom.get(socket.id)`
- Delegates to game instance methods
- Game loop broadcasts `gameState` at **60 FPS**

Vibration Feedback:

`server/server.js` (lines 362–380)

- Server emits `game:vibrate` with `playerId`, `duration`, and `pattern`
- Finds player socket and emits `controller:vibrate`
- Mobile device handles vibration via **Vibration API**

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

## Blockchain Integration

### Network Configuration

The application connects to Hedera Testnet by default, with configuration centralized in hedera-config.js.

### SDK Initialization Patterns

#### Server-Side Client Initialization

The initializeHederaClient() function creates a Hedera SDK Client instance.
The operator account is required for submitting transactions but optional for read-only queries. Without credentials, the client can still query the mirror node.

#### Client-Side Service Initialization

The HederaService class manages browser-side blockchain connectivity:

Key Properties:

- dAppConnector: WalletConnect DAppConnector instance
- currentSession: Active WalletConnect session
- currentNetwork: Network selection ('mainnet' | 'testnet')
- projectId: WalletConnect project ID from environment.

The init() method performs dynamic import of @hashgraph/hedera-wallet-connect to avoid SSR issues, then initializes the DAppConnector with metadata and supported RPC methods.

#### HederaService Methods:

| **Method**                          | **Purpose**                                       | **Returns**                 |
| ----------------------------------- | ------------------------------------------------- | --------------------------- |
| `init(network)`                     | Initialize `DAppConnector` with specified network | `Promise<boolean>`          |
| `connect()`                         | Open wallet selection modal                       | `Promise<HederaWalletData>` |
| `signAuthMessage(address)`          | Sign authentication message                       | `Promise<HederaWalletData>` |
| `signTransaction(bytes, accountId)` | Sign transaction with connected wallet            | `Promise<signature>`        |
| `disconnect()`                      | Close WalletConnect session                       | `Promise<boolean>`          |
| `hasActiveSession()`                | Check if a WalletConnect session is active        | `boolean`                   |
| `getCurrentWalletAddress()`         | Get the currently connected wallet address        | `string \| null`            |

#### Client-Side Integration Architecture:

![Client-Side Integration Architecture](./client/public/schemas/client-side-integration-architecture.png)

#### Server-Side Integration Architecture:

![Server-Side Integration Architecture](./client/public/schemas/server-side-integration-architecture.png)

The platform integrates with **Hedera Hashgraph** through several key components:
**Server-side integration:**

- `ContractService` – Read operations from smart contracts
- `TransactionService` – Write operations and transaction execution
- Dual approach: Hedera SDK for simple queries, JSON-RPC for complex returns

**Client-side integration:**

- `HederaService` – Singleton service for Hedera wallet operations
- `WalletContext` – React context for global wallet state
- Supports three connection methods: WalletConnect, HashPack, Blade

**Key components:**

- `ContractService` — Smart contract interaction
- `TransactionService` — Transaction execution
- `WalletContext` — Global wallet state
- `HederaService` — API for Hedera operations

#### Transaction Signing Flow

The application implements a client-side signing pattern where users sign transactions with their own wallets, ensuring custody of private keys.
![Transaction Signing Flow](./client/public/schemas/transaction-signing-flow.png)

---

## Built-in Games

| Game              | Genre            | Players | Description                            |
| ----------------- | ---------------- | ------- | -------------------------------------- |
| **Battle Arena**  | Top-down Shooter | 2–10    | PvE action with AI bots                |
| **Race Track**    | Racing           | 2–10    | Real-time checkpoint racing            |
| **Tower Defence** | Strategy         | 1–4     | Co-op base defense against enemy waves |
| **Quiz Game**     | Trivia           | 2–10    | Interactive knowledge-based quiz game  |

---

## Hedera Smart Contracts

This integration provides server-side access to Hedera smart contracts deployed on the testnet.
A total of **9 smart contracts** have been deployed:

| Contract                | Address                                      | Purpose                   |
| ----------------------- | -------------------------------------------- | ------------------------- |
| **GameRegistry**        | `0xda0cbeae027b044648386e4c27e20c18257c885a` | Game registration         |
| **TokenEconomy**        | `0x23f6bb3a2c8babee952e0443b6b7350aa85d6ab9` | HPLAY token               |
| **LotteryPool**         | `0x9bb862643a73725e636dd7d7e30306844aa099f3` | Lottery system            |
| **PlayerSBT**           | `0xfe9CF4dde9fBc14d61D26703354AA10414B35Ea6` | SoulBound tokens          |
| **NFTManager**          | `0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860` | NFT achievements          |
| **FaucetManager**       | `0xee9e9daf635aadcbe7725faae73f6d38f66cfb3a` | Faucet system             |
| **ResultVerifier**      | `0xb1583369fe74fbf2d9b87b870fe67d6d0dc13b84` | Match result verification |
| **HederaGameLaunchpad** | `0x54d13a05c632738674558f18de4394b7ee9a0399` | Main contract             |

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

### Token Architecture

The platform operates a two-token system where HBAR (Hedera's native cryptocurrency) serves as the input currency and HPLAY (platform game token) serves as the reward and in-game currency. The FaucetManager contract orchestrates the conversion between these tokens, while TokenEconomy manages HPLAY supply and distribution, and LotteryPool accumulates fees for prize distribution.

### HPLAY Token Properties

#### Technical Specifications

Token Characteristics:

- Name: "Hedera Play Token" (HPLAY)
- Decimals: 8 (matching HBAR's tinybar precision)
- Initial Max Supply: 100 billion HPLAY (configurable by admin)
- Supply Model: Mintable on-demand up to max supply
- Standard: ERC20-compatible

### Token Distribution Model

The platform allocates the **HPLAY** token supply across five primary categories:

| **Category**          | **Allocation** | **Purpose**                                 |
| --------------------- | -------------- | ------------------------------------------- |
| **Player Rewards**    | 40%            | Game completion, achievements, leaderboards |
| **Development Fund**  | 20%            | Team incentives, ongoing development        |
| **DAO Treasury**      | 20%            | Community governance and proposals          |
| **Marketing Events**  | 10%            | User acquisition, promotional campaigns     |
| **Liquidity Reserve** | 10%            | Exchange listings, market making            |

#### Distribution Strategy:

- Tokens are minted on-demand rather than pre-minted
- Supply cap prevents inflation beyond 100 billion tokens
- Admin can adjust maxSupply if needed via updateMaxSupply()

### Token Acquisition Mechanisms

#### Swap Mechanism (HBAR → HPLAY)

![Swap Mechanism](./client/public/schemas/swap-mechanism.png)

### Reward Mechanisms

#### Players earn HPLAY through:

1. Game Completion Rewards:

- Distributed by ResultVerifier contract
- Triggered on verified game result submission
- Amount varies by game type and performance

2. Achievement NFTs:

- Minting NFTs requires HPLAY burn
- Costs by rarity tier:

* Common: 10 HPLAY
* Rare: 50 HPLAY
* Epic: 200 HPLAY
* Legendary: 1000 HPLAY

3. Lottery Winnings:

- LotteryPool accumulates platform commissions
- Periodic draws distribute accumulated HPLAY
- Entry requires active gameplay participation

![Token Economy](./client/public/schemas/token.png)

---

### Integration with Platform Systems

#### TokenEconomy Minter Role

The `FaucetManagerV2` contract must be granted the `MINTER_ROLE` in `TokenEconomyV2` to mint tokens:

```solidity
// contracts/core/TokenEconomyV2.sol (lines 35–38)
function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
    require(totalSupply() + amount <= maxSupply, "TokenEconomyV2: exceeds max supply");
    _mint(to, amount);
}
```

This role-based access control ensures that only **authorized contracts** can increase the **HPLAY** token supply.

---

#### HederaGameLaunchpad Integration

The main orchestrator contract — **HederaGameLaunchpad** — coordinates all token economy operations:

- Routes **swap transactions** through `FaucetManagerV2`
- Coordinates **reward distribution** via `TokenEconomyV2`
- Manages **NFT minting** through `NFTManager` (which burns HPLAY)
- Funds **LotteryPool** with HPLAY commissions

---

### Security Considerations

#### Access Control

The token economy implements **multi-layered access control** to ensure secure operation across contracts.

**Role-Based Permissions:**

- `DEFAULT_ADMIN_ROLE`: Max supply adjustments, emergency withdrawals
- `MINTER_ROLE`: Token minting (granted to `FaucetManager`, `ResultVerifier`)
- `PAUSER_ROLE`: Emergency pause functionality
- `ADMIN_ROLE`: Rate and limit configuration (`FaucetManager`)

**Rate Limiting:**

- Per-user **daily swap limits** prevent abuse
- **Time-based reset** prevents gaming the system
- **Global enable/disable switch** allows emergency shutdown

**Supply Cap Enforcement:**

- **Hard cap** prevents uncontrolled inflation
- Mint operations verify `totalSupply() + amount <= maxSupply`
- Admins can only increase — not decrease — `maxSupply` below current supply

**Sources:**

- `contracts/core/TokenEconomyV2.sol` (lines 14–15)
- `contracts/core/FaucetManagerV2.sol` (line 18)

---

#### Non-Custodial Transaction Flow

Users maintain **full control over their funds** through client-side transaction signing:

1. Server creates **unsigned swap transaction**
2. User signs with their wallet (`WalletConnect`, `HashPack`, or `Blade`)
3. Server submits the **signed transaction** to the Hedera network
4. **Private keys never leave the user's device**

---

## Wallets and Authentication

Supported wallets: **WalletConnect**, **HashPack**, **Blade**

- Client-side transaction signing
- Automatic session recovery
- Mainnet/Testnet compatibility

---

### Hedera Wallet Providers

Three connection methods are supported with automatic fallback:

1. **WalletConnect** – Cross-platform mobile wallet connection via QR code
2. **HashPack** – Browser extension with direct integration
3. **Blade** – Browser extension with direct integration

---

### Global Wallet State

`WalletContext` provides global wallet state throughout the application:

**Main state properties:**

- `isConnected` – Whether the wallet is connected
- `walletAddress` – Connected wallet address
- `walletType` – Active connection method
- `network` – Active network (mainnet/testnet)
- `dAppConnector` – Instance of WalletConnect DAppConnector
- `currentSession` – Active WalletConnect session

---

## API and Contract Integration

## Contract API Integration

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
	body: JSON.stringify({ score: 1500, gameId: 'shooter-game' }),
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

### Smart Contract Security Features

- **Role-based access control:** Owner, DAO, Server, and Game Server roles
- **Reentrancy protection:** All external calls are secured
- **Signature verification:** ECDSA signatures with replay protection
- **Nonce validation:** Monotonic nonce system prevents replay attacks
- **Timestamp validation:** Signature expiration enforcement
- **Pause functionality:** Emergency stop for all contracts
- **Input validation:** Comprehensive parameter checks

---

### Client-Side Transaction Signing

The platform implements a **client-side signing** pattern, where users sign transactions directly with their wallets, ensuring private keys are never exposed.

Process includes:

1. Transaction creation on the server
2. Freezing the transaction with the user as payer
3. User signs via WalletConnect/HashPack/Blade
4. Signed transaction is submitted for execution

---

## Tech Stack

**Backend:**

- Node.js – Runtime environment
- Express – Web framework
- Socket.io – Real-time bidirectional communication
- Hedera SDK – Integration with Hedera blockchain
- Prisma – ORM for database access
- PostgreSQL – Relational database

**Frontend:**

- Next.js 16 – React framework with App Router
- React 19 – UI library
- TypeScript – Strong typing
- TailwindCSS 4 – Utility-first styling
- NextAuth – Authentication and session management

**Game Engine:**

- PixiJS v8 – High-performance 2D WebGL rendering
- 60 FPS game loop with delta time calculations

**Blockchain:**

- Hedera Hashgraph – Testnet
- Solidity – Smart contract language
- Hardhat – Smart contract development and testing
- ethers.js – Contract interaction library

---

## Contract Testing

### Contract Tests

```bash
cd contracts
pnpm test                    # Run all tests
pnpm run test:coverage       # Run with coverage
```

The test suite includes:

- **Unit tests:** Individual contract functionality
- **Integration tests:** Contract-to-contract interaction
- **Security tests:** Access control and validation
- **Gas tests:** Optimization verification

### Integration Testing

```bash
# Test contract interactions
node server/scripts/test-contracts.js

# Quick tests
pnpm run test:fast
```

---

## Monitoring

### Key Metrics

- Total games played
- Active players
- Distributed HPLAY
- Lottery pool balance
- NFTs minted
- System health status

### Events

All major operations emit monitoring events:

```solidity
event GameResultVerified(address indexed player, string indexed gameId, uint256 score);
event PlayerSBTMinted(address indexed player, uint256 tokenId);
event NFTMinted(address indexed player, uint256 tokenId, string achievementType);
event LotteryWinner(address indexed winner, uint256 prizeAmount);
```

---

## Use Cases

**Perfect for:**

- **House parties** – instant fun for guests
- **Corporate events** – team-building activities
- **Family gatherings** – entertainment for all ages
- **Event venues** – interactive game zones
- **Schools** – educational gaming sessions
- **Gaming cafés** – no controller maintenance required

---

## Roadmap

**Coming soon:**

- More game types (puzzles, platformers, fighters)
- Custom game rooms with passwords
- Player profiles and stats
- Replay system
- Spectator mode
- Tournament brackets
- Custom skins and themes
- Cross-game compatibility
- Layer-2 scalability integration
- Decentralized random number generation
- Governance token implementation

---

## Contributing

Contributions are welcome!

- Add new games
- Fix bugs
- Improve documentation
- Enhance UI/UX

Feel free to open issues and pull requests.

---

## Support

**If you have questions, suggestions, or issues:**

- Create an issue in the repository
- Check the documentation
- Review test cases for usage examples

**Connect with us on social media:**

**Ihor Sokolov:**

- 💬 [Telegram](https://t.me/iampublion)
- 🐦 [Twitter](https://x.com/ampublion)
- 🌐 [LinkedIn](https://linkedin.com/in/mafstat)

**Irina Semichasova:**

- 💬 [Telegram](https://t.me/irine7)
- 🐦 [Twitter](https://x.com/irine_es)
- 🌐 [LinkedIn](https://linkedin.com/in/irina-semichasova)

---

## License

**Copyright © 2025 Ihor Sokolov (foundermafstat) & Irina Semichasova (Irine7), Web3Pad Team (All Rights Reserved)**
