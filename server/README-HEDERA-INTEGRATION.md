# Hedera Smart Contract Integration

This integration provides server-side access to Hedera smart contracts deployed on the testnet.

## Features

- ✅ **Contract Data Reading**: Read data from all deployed smart contracts
- ✅ **Player Information**: Get comprehensive player stats, SBT status, NFT count
- ✅ **Token Economy**: Check balances, staking, rewards
- ✅ **Game Registry**: Access game information and difficulty settings
- ✅ **Lottery System**: Monitor pool balance and participants
- ✅ **Faucet Integration**: Check swap rates and user limits
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Rate Limiting**: Built-in rate limiting for API protection
- ✅ **Validation**: Input validation for all parameters

## Quick Start

### 1. Install Dependencies

```bash
cd server
pnpm install
```

### 2. Configure Environment

Copy the example environment file and update with your values:

```bash
cp hedera-env-example.txt .env
```

Update the following variables in your `.env` file:

```env
# Hedera Account Configuration
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your_private_key_here

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/w3p_db"

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
```

### 3. Test Integration

Run the test script to verify everything works:

```bash
node scripts/test-contracts.js
```

### 4. Start Server

```bash
pnpm start
# or for development
pnpm dev
```

## API Endpoints

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

## Contract Addresses

The following contracts are deployed on Hedera Testnet:

| Contract | Address |
|----------|---------|
| GameRegistry | `0xdA0cBEaE027b044648386e4c27e20C18257C885A` |
| TokenEconomy | `0x23f6bb3a2c8babee952e0443b6b7350aa85d6ab9` |
| LotteryPool | `0x9BB862643a73725E636dD7d7E30306844aA099f3` |
| PlayerSBT | `0xfe9CF4dde9fBc14d61D26703354AA10414B35Ea6` |
| NFTManager | `0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860` |
| FaucetManager | `0xe334AfEc78B410C953A9bEa0Ff1E55F74bdeC212` |
| ResultVerifier | `0xb1583369fe74FBf2D9b87B870FE67D6D0DC13b84` |
| HederaGameLaunchpad | `0x54d13a05C632738674558f18De4394b7Ee9A0399` |

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

## Rate Limiting

- **Limit**: 50 requests per minute per IP address
- **Headers**: Rate limit information included in responses
- **Retry-After**: Header provided when limit exceeded

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   Express API    │───▶│  Contract       │
│                 │    │   /api/contracts │    │  Service        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                         │
                                ▼                         ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Error Handler   │    │  Hedera SDK     │
                       │  & Validation   │    │  Client         │
                       └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Hedera Testnet  │
                                                │ Smart Contracts │
                                                └─────────────────┘
```

## Development

### Project Structure

```
server/
├── lib/
│   ├── hedera-config.js          # Hedera client configuration
│   ├── contract-service.js       # Contract interaction service
│   └── contract-error-handler.js # Enhanced error handling
├── middleware/
│   └── contract-middleware.js   # API middleware
├── routes/
│   └── contracts.js             # API routes
├── scripts/
│   └── test-contracts.js        # Integration test script
└── docs/
    └── contract-api.md          # API documentation
```

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

## Performance

- **Caching**: Consider implementing caching for frequently accessed data
- **Connection Pooling**: Hedera client handles connection pooling
- **Retry Logic**: Built-in retry mechanism for failed calls
- **Rate Limiting**: Prevents overwhelming the blockchain

## Support

For issues or questions:

1. Check the logs for detailed error information
2. Verify environment configuration
3. Test with the provided test script
4. Review API documentation

## License

MIT License - see LICENSE file for details.
