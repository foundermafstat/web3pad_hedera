/**
 * Grant GAME_SERVER_ROLE on PlayerSBT to a target Hedera account.
 *
 * Requirements:
 * - OWNER_ACCOUNT_ID and OWNER_PRIVATE_KEY must belong to the contract owner (has OWNER_ROLE).
 * - PLAYER_SBT_HEDERA_ID must point to the deployed PlayerSBT contract (Hedera ID, e.g. 0.0.7153887).
 * - TARGET_ACCOUNT_ID is the Hedera account to grant (e.g. 0.0.7154350).
 *
 * Usage examples:
 *   pnpm ts-node contracts/scripts/grant-game-server-role.ts 0.0.7154350
 *   TARGET_ACCOUNT_ID=0.0.7154350 pnpm ts-node contracts/scripts/grant-game-server-role.ts
 */

import {
	Client,
	AccountId,
	PrivateKey,
	ContractExecuteTransaction,
	ContractFunctionParameters,
} from '@hashgraph/sdk';
import { keccak256, toUtf8Bytes } from 'ethers';

async function main() {
	const OWNER_ACCOUNT_ID = process.env.OWNER_ACCOUNT_ID;
	const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
	const PLAYER_SBT_HEDERA_ID =
		process.env.PLAYER_SBT_HEDERA_ID || '0.0.7153887';

	// Target can be provided via CLI arg or env
	const argTarget = process.argv[2];
	const TARGET_ACCOUNT_ID =
		process.env.TARGET_ACCOUNT_ID || argTarget || '0.0.7154350';

	if (!OWNER_ACCOUNT_ID || !OWNER_PRIVATE_KEY) {
		throw new Error(
			'OWNER_ACCOUNT_ID and OWNER_PRIVATE_KEY must be set in env'
		);
	}

	if (!PLAYER_SBT_HEDERA_ID) {
		throw new Error('PLAYER_SBT_HEDERA_ID must be set in env');
	}

	if (!/^\d+\.\d+\.\d+$/.test(TARGET_ACCOUNT_ID)) {
		throw new Error(
			`Invalid TARGET_ACCOUNT_ID format: ${TARGET_ACCOUNT_ID}. Expected 0.0.x`
		);
	}

	console.log('Granting GAME_SERVER_ROLE to:', TARGET_ACCOUNT_ID);
	console.log('Contract (PlayerSBT):', PLAYER_SBT_HEDERA_ID);

	// Compute bytes32 role id = keccak256("GAME_SERVER_ROLE")
	const roleHex = keccak256(toUtf8Bytes('GAME_SERVER_ROLE')); // 0x-prefixed 32-byte hex
	const roleBytes = Buffer.from(roleHex.slice(2), 'hex');

	const client = Client.forTestnet().setOperator(
		AccountId.fromString(OWNER_ACCOUNT_ID),
		PrivateKey.fromString(OWNER_PRIVATE_KEY)
	);

	// Convert Hedera account ID to 20-byte EVM address string
	const targetAcc = AccountId.fromString(TARGET_ACCOUNT_ID);
	const targetSolidity = `0x${targetAcc.toSolidityAddress()}`;

	const tx = new ContractExecuteTransaction()
		.setContractId(PLAYER_SBT_HEDERA_ID)
		.setFunction(
			'grantRole',
			new ContractFunctionParameters()
				.addBytes32(roleBytes)
				.addAddress(targetSolidity)
		)
		.setGas(1_000_000);

	const res = await tx.execute(client);
	const receipt = await res.getReceipt(client);
	console.log('grantRole status:', receipt.status.toString());
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
