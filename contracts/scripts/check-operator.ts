import {
  AccountId,
  Client,
  PrivateKey,
  AccountBalanceQuery,
  AccountInfoQuery,
} from '@hashgraph/sdk';

async function main() {
  const OWNER_ACCOUNT_ID = process.env.OWNER_ACCOUNT_ID;
  const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

  if (!OWNER_ACCOUNT_ID || !OWNER_PRIVATE_KEY) {
    throw new Error('OWNER_ACCOUNT_ID and OWNER_PRIVATE_KEY must be set');
  }

  const client = Client.forTestnet().setOperator(
    AccountId.fromString(OWNER_ACCOUNT_ID),
    PrivateKey.fromString(OWNER_PRIVATE_KEY)
  );

  console.log('Operator:', OWNER_ACCOUNT_ID);

  // Derive public key from provided private key
  const pk = PrivateKey.fromString(OWNER_PRIVATE_KEY);
  const derivedPub = pk.publicKey.toStringDer();
  console.log('Derived public key (DER):', derivedPub);

  // Fetch on-chain account key and basic checks
  const info = await new AccountInfoQuery()
    .setAccountId(OWNER_ACCOUNT_ID)
    .execute(client);

  const networkKey = info.key?.toStringDer();
  console.log('Network account key (DER):', networkKey);
  console.log('Public key matches:', derivedPub === networkKey);

  // Try a lightweight signed query to assert signatures are valid
  const bal = await new AccountBalanceQuery()
    .setAccountId(OWNER_ACCOUNT_ID)
    .execute(client);

  console.log('Balance (tinybars):', bal.hbars.toTinybars().toString());
  console.log('Signature check passed: queries succeed with provided key');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


