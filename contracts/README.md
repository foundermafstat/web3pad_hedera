# Hedera Game Launchpad Smart Contracts

A comprehensive decentralized gaming platform built on Hedera Hashgraph, featuring off-chain game execution with on-chain result verification, player identity management through SoulBound Tokens (SBT), NFT-based achievements, and a robust token economy.

## 🎮 Features

- **Off-chain Game Execution**: Games run off-chain with cryptographic result verification
- **SoulBound Tokens (SBT)**: Non-transferable player identity tokens tracking stats and achievements
- **NFT Achievement System**: Mintable achievement NFTs with rarity-based burn mechanics
- **HPLAY Token Economy**: Deflationary utility token with staking rewards and lottery system
- **HBAR Faucet**: Testnet HBAR to HPLAY conversion system
- **Lottery Pool**: Automatic lottery funded by transaction fees
- **Modular Architecture**: Expandable system for adding new games

## 🏗️ Architecture

### Core Contracts

1. **HederaGameLaunchpad** - Main orchestrator contract
2. **GameRegistry** - Manages game module registration and server authorization
3. **ResultVerifier** - Handles cryptographic signature verification of game results
4. **PlayerSBT** - SoulBound Token for player identity and statistics
5. **NFTManager** - Achievement NFT minting and management
6. **TokenEconomy** - HPLAY token with staking and deflationary mechanics
7. **FaucetManager** - HBAR to HPLAY swap functionality
8. **LotteryPool** - Fee-based lottery system with weighted random selection

### Libraries

- **SignatureVerification** - Cryptographic signature handling and validation
- **RewardCalculations** - Economic formulas and reward calculations
- **AccessControlLib** - Role-based access control utilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Hedera Testnet account with HBAR

### Installation

```bash
cd contracts
npm install
```

### Configuration

1. Copy environment template:
```bash
cp env.example .env
```

2. Fill in your configuration in `.env`:
```env
PRIVATE_KEY=your_private_key_here
ACCOUNT_ID=your_account_id_here
HEDERA_TESTNET_URL=https://testnet.hashio.io/api
```

### Compilation

```bash
npm run compile
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Deployment

```bash
# Deploy to Hedera Testnet
npm run deploy:testnet

# Configure deployed contracts
npm run configure

# Test interactions
npm run test-interactions
```

## 📋 Contract Specifications

### Token Economy

- **Name**: Hedera Play Token (HPLAY)
- **Symbol**: HPLAY
- **Decimals**: 8
- **Total Supply**: 10,000,000,000 HPLAY
- **Distribution**:
  - 40% Game Rewards Pool
  - 20% Developer Incentives
  - 20% DAO Treasury
  - 10% Marketing Events
  - 10% Liquidity Reserve

### Game Result Verification

Games submit results with cryptographic signatures:

```solidity
struct GameResult {
    address player;
    string gameId;
    uint256 score;
    uint256 timestamp;
    uint256 nonce;
    bytes32 resultHash;
}
```

Signature verification prevents replay attacks and ensures authenticity.

### NFT Achievement System

Achievement NFTs have rarity levels with different burn fees:

- **Common**: 10 HPLAY burn fee
- **Rare**: 50 HPLAY burn fee
- **Epic**: 200 HPLAY burn fee
- **Legendary**: 1000 HPLAY burn fee

### Lottery System

- **Draw Interval**: 24 hours (configurable)
- **Funding**: 0.5% of all HPLAY transfers
- **Selection**: Weighted by transaction count and volume
- **Prize**: Entire accumulated pool

## 🔧 Scripts

### Deployment Scripts

- `deploy.ts` - Deploys all contracts and initializes the system
- `configure.ts` - Configures deployed contracts with initial parameters
- `testInteractions.ts` - Tests contract interactions and functionality

### Available Commands

```bash
npm run compile          # Compile contracts
npm run test            # Run tests
npm run deploy:testnet  # Deploy to Hedera Testnet
npm run configure       # Configure deployed contracts
npm run test-interactions # Test contract interactions
npm run clean           # Clean build artifacts
```

## 🛡️ Security Features

- **Role-based Access Control**: Owner, DAO, Server, and Game Server roles
- **Reentrancy Protection**: All external calls protected
- **Signature Verification**: ECDSA signatures with replay protection
- **Nonce Validation**: Monotonic nonce system prevents replay attacks
- **Timestamp Validation**: Signature expiration prevents stale submissions
- **Pause Functionality**: Emergency pause for all contracts
- **Input Validation**: Comprehensive parameter validation

## 📊 Gas Optimization

- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Multiple operations in single transaction
- **Event Indexing**: Off-chain data retrieval via events
- **Library Usage**: Reusable code reduces deployment size

## 🧪 Testing

The test suite covers:

- **Unit Tests**: Individual contract functionality
- **Integration Tests**: Cross-contract interactions
- **Security Tests**: Access control and validation
- **Gas Tests**: Optimization verification

### Test Structure

```
test/
├── GameRegistry.test.ts    # Game registration tests
├── TokenEconomy.test.ts    # Token economy tests
└── integration.test.ts     # Full system integration tests
```

## 🌐 Network Configuration

### Hedera Testnet

- **RPC URL**: https://testnet.hashio.io/api
- **Chain ID**: 296
- **Native Token**: HBAR

### Hedera Mainnet

- **RPC URL**: https://mainnet.hashio.io/api
- **Chain ID**: 295
- **Native Token**: HBAR

## 📝 Environment Variables

Key environment variables for deployment:

```env
# Network Configuration
HEDERA_TESTNET_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_CHAIN_ID=296

# Account Configuration
PRIVATE_KEY=your_private_key_here
ACCOUNT_ID=your_account_id_here

# Contract Addresses (filled after deployment)
MAIN_CONTRACT_ADDRESS=
GAME_REGISTRY_ADDRESS=
# ... other contract addresses

# Game Server Configuration
GAME_SERVER_PRIVATE_KEY=your_game_server_private_key_here
GAME_SERVER_PUBLIC_KEY=your_game_server_public_key_here
```

## 🔄 Workflow

### Game Integration

1. **Register Game Module**: Use `GameRegistry.registerGameModule()`
2. **Set Server Keys**: Configure cryptographic keys for result signing
3. **Implement Signature**: Game server signs results with player data
4. **Submit Results**: Use `ResultVerifier.submitGameResult()`
5. **Handle Rewards**: System automatically mints HPLAY rewards

### Player Onboarding

1. **Mint SBT**: Player receives SoulBound Token for identity
2. **Acquire HPLAY**: Use faucet to swap HBAR for HPLAY
3. **Play Games**: Submit results for verification and rewards
4. **Earn NFTs**: Achieve milestones to mint achievement NFTs
5. **Participate in Lottery**: Automatic entry via transactions

## 📈 Monitoring

### Key Metrics

- Total games played
- Active players
- HPLAY distributed
- Lottery pool balance
- NFT minted
- System health status

### Events

All major operations emit events for monitoring:

```solidity
event GameResultVerified(address indexed player, string indexed gameId, uint256 score);
event PlayerSBTMinted(address indexed player, uint256 tokenId);
event NFTMinted(address indexed player, uint256 tokenId, string achievementType);
event LotteryWinner(address indexed winner, uint256 prizeAmount);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:

- Create an issue in the repository
- Check the documentation
- Review the test cases for usage examples

## 🔮 Future Enhancements

- Cross-game interoperability
- Layer-2 scaling integration
- Decentralized random number generation
- Governance token implementation
- Bridge to other networks
- Advanced gamification mechanics

---

**Built with ❤️ for the Hedera ecosystem**