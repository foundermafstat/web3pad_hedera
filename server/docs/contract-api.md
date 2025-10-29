# Hedera Smart Contract Integration API

This document describes the API endpoints for interacting with Hedera smart contracts deployed on the testnet.

## Base URL
```
/api/contracts
```

## Authentication
Most endpoints are public and don't require authentication. Rate limiting is applied (50 requests per minute per IP).

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

## System Endpoints

### Get System Statistics
```http
GET /api/contracts/system/stats
```

Returns comprehensive system statistics including games played, players, rewards distributed, etc.

**Response:**
```json
{
    "success": true,
    "data": {
        "gamesPlayed": 150,
        "players": 45,
        "rewardsDistributed": 1000000,
        "poolBalance": 500000,
        "totalParticipants": 30,
        "initialized": true
    }
}
```

### Check System Status
```http
GET /api/contracts/system/operational
```

Checks if the system is operational.

**Response:**
```json
{
    "success": true,
    "data": {
        "operational": true
    }
}
```

## Player Endpoints

### Get Player Information
```http
GET /api/contracts/player/:address/info
```

Gets comprehensive player information including SBT status, stats, NFT count, and token balance.

**Parameters:**
- `address` (string): Player's wallet address

**Response:**
```json
{
    "success": true,
    "data": {
        "hasSBT": true,
        "stats": {
            "totalGamesPlayed": 10,
            "totalWins": 7,
            "totalPoints": 15000,
            "totalLosses": 3,
            "averageScore": 1500,
            "lastGameTimestamp": 1704067200
        },
        "nftCount": 3,
        "hplayBalance": 5000
    }
}
```

### Get Player Statistics
```http
GET /api/contracts/player/:address/stats
```

Gets detailed player statistics.

**Parameters:**
- `address` (string): Player's wallet address

### Get Game-Specific Statistics
```http
GET /api/contracts/player/:address/game-stats/:gameId
```

Gets statistics for a specific game.

**Parameters:**
- `address` (string): Player's wallet address
- `gameId` (string): Game identifier

### Check SBT Status
```http
GET /api/contracts/player/:address/sbt
```

Checks if player has a SoulBound Token.

**Parameters:**
- `address` (string): Player's wallet address

### Get NFT Count
```http
GET /api/contracts/player/:address/nft-count
```

Gets the number of NFTs owned by the player.

**Parameters:**
- `address` (string): Player's wallet address

## Token Endpoints

### Get Token Balance
```http
GET /api/contracts/token/balance/:address
```

Gets HPLAY token balance for an address.

**Parameters:**
- `address` (string): Wallet address

**Response:**
```json
{
    "success": true,
    "data": {
        "balance": 10000
    }
}
```

### Get Total Supply
```http
GET /api/contracts/token/supply
```

Gets total HPLAY token supply.

### Get Staked Balance
```http
GET /api/contracts/token/staked/:address
```

Gets staked token balance for an address.

## Game Endpoints

### Get Game Information
```http
GET /api/contracts/games/:gameId/info
```

Gets game module information.

**Parameters:**
- `gameId` (string): Game identifier

**Response:**
```json
{
    "success": true,
    "data": {
        "authorizedServer": "0x123...",
        "serverPublicKey": "0xabc...",
        "gameId": "shooter-game",
        "metadataURI": "ipfs://...",
        "registrationTimestamp": 1704067200,
        "isActive": true,
        "nonce": 5
    }
}
```

### Get Game Difficulty
```http
GET /api/contracts/games/:gameId/difficulty
```

Gets difficulty multiplier for a game.

### Get Total Games
```http
GET /api/contracts/games/total
```

Gets total number of registered games.

## Lottery Endpoints

### Get Pool Balance
```http
GET /api/contracts/lottery/pool-balance
```

Gets current lottery pool balance.

### Get Participants Count
```http
GET /api/contracts/lottery/participants
```

Gets total number of lottery participants.

### Get Next Draw Time
```http
GET /api/contracts/lottery/next-draw
```

Gets time until next lottery draw in seconds.

## Faucet Endpoints

### Get Swap Rate
```http
GET /api/contracts/faucet/swap-rate
```

Gets current faucet swap rate information.

**Response:**
```json
{
    "success": true,
    "data": {
        "hbarToHplayRate": 50000000000,
        "bonusMultiplierMin": 100,
        "bonusMultiplierMax": 150,
        "dailyLimitHbar": 100000000000,
        "faucetEnabled": true
    }
}
```

### Get User Swap Info
```http
GET /api/contracts/faucet/user/:address
```

Gets user's swap information and limits.

## Reward Calculation

### Calculate Reward
```http
POST /api/contracts/rewards/calculate
```

Calculates reward amount for a given score and game.

**Request Body:**
```json
{
    "score": 1500,
    "gameId": "shooter-game"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "rewardAmount": 150
    }
}
```

## Error Types

- `VALIDATION_ERROR`: Invalid input parameters
- `CONTRACT_CALL_FAILED`: Contract function call failed
- `INVALID_CONTRACT_ADDRESS`: Invalid contract address
- `INSUFFICIENT_BALANCE`: Insufficient balance for operation
- `UNAUTHORIZED`: Unauthorized access
- `NOT_FOUND`: Resource not found
- `BLOCKCHAIN_ERROR`: Blockchain service error
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

- 50 requests per minute per IP address
- Rate limit headers included in responses
- Retry-After header provided when limit exceeded

## Contract Addresses

The following contracts are deployed on Hedera Testnet:

- **GameRegistry**: `0xdA0cBEaE027b044648386e4c27e20C18257C885A`
- **TokenEconomy**: `0x0c8f77D99Ff0A20C4b5308abe24163C70C781963`
- **LotteryPool**: `0x9BB862643a73725E636dD7d7E30306844aA099f3`
- **PlayerSBT**: `0xfe9CF4dde9fBc14d61D26703354AA10414B35Ea6`
- **NFTManager**: `0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860`
- **FaucetManager**: `0xe334AfEc78B410C953A9bEa0Ff1E55F74bdeC212`
- **ResultVerifier**: `0xb1583369fe74FBf2D9b87B870FE67D6D0DC13b84`
- **HederaGameLaunchpad**: `0x54d13a05C632738674558f18De4394b7Ee9A0399`

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
