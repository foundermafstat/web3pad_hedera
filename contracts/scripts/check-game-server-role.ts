import {
  AccountId,
  PrivateKey,
  Client,
  ContractCallQuery,
  ContractFunctionParameters,
} from '@hashgraph/sdk';
import { keccak256, toUtf8Bytes } from 'ethers';

async function main() {
  const OWNER_ACCOUNT_ID = process.env.OWNER_ACCOUNT_ID;
  const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
  const PLAYER_SBT_HEDERA_ID = process.env.PLAYER_SBT_HEDERA_ID;

  const argTarget = process.argv[2];
  const TARGET_ACCOUNT_ID = process.env.TARGET_ACCOUNT_ID || argTarget;

  if (!OWNER_ACCOUNT_ID || !OWNER_PRIVATE_KEY) {
    throw new Error('OWNER_ACCOUNT_ID and OWNER_PRIVATE_KEY must be set');
  }
  if (!PLAYER_SBT_HEDERA_ID) {
    throw new Error('PLAYER_SBT_HEDERA_ID must be set');
  }
  if (!TARGET_ACCOUNT_ID) {
    throw new Error('Provide TARGET_ACCOUNT_ID via env or argv');
  }

  const client = Client.forTestnet().setOperator(
    AccountId.fromString(OWNER_ACCOUNT_ID),
    PrivateKey.fromString(OWNER_PRIVATE_KEY)
  );

  const roleHex = keccak256(toUtf8Bytes('GAME_SERVER_ROLE'));
  const roleBytes = Buffer.from(roleHex.slice(2), 'hex');

  const targetAccount = AccountId.fromString(TARGET_ACCOUNT_ID);
  const targetAddress = `0x${targetAccount.toSolidityAddress()}`;

  console.log('Checking GAME_SERVER_ROLE on PlayerSBT', PLAYER_SBT_HEDERA_ID);
  console.log('Target account:', TARGET_ACCOUNT_ID, targetAddress);

  const res = await new ContractCallQuery()
    .setContractId(PLAYER_SBT_HEDERA_ID)
    .setGas(300_000)
    .setFunction(
      'hasRole',
      new ContractFunctionParameters()
        .addBytes32(roleBytes)
        .addAddress(targetAddress)
    )
    .execute(client);

  const hasRole = res.getBool(0);
  console.log('hasRole(GAME_SERVER_ROLE):', hasRole);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


