import { ethers } from "hardhat";
import type { Contract } from "ethers";
import fs from "fs";
import path from "path";
import { AccountId } from "@hashgraph/sdk";

const OWNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OWNER"));

interface ModuleAddresses {
  gameRegistry: string;
  resultVerifier: string;
  playerSBT: string;
  nftManager: string;
  tokenEconomy: string;
  faucetManager: string;
  lotteryPool: string;
  launchpad: string;
}

const RAW_ADDRESSES: ModuleAddresses = {
  gameRegistry: process.env.GAME_REGISTRY_ADDRESS ?? "0xda0cbeae027b044648386e4c27e20c18257c885a",
  resultVerifier: process.env.RESULT_VERIFIER_ADDRESS ?? "0xb1583369fe74fbf2d9b87b870fe67d6d0dc13b84",
  playerSBT: process.env.PLAYER_SBT_ADDRESS ?? "0xfe9cf4dde9fbc14d61d26703354aa10414b35ea6",
  nftManager: process.env.NFT_MANAGER_ADDRESS ?? "0x01af1c62098d0217dee7bc8a72dd93fa6d02b860",
  tokenEconomy: process.env.TOKEN_ECONOMY_ADDRESS ?? "0x23f6bb3a2c8babee952e0443b6b7350aa85d6ab9",
  faucetManager: process.env.FAUCET_MANAGER_ADDRESS ?? "0xe334afec78b410c953a9bea0ff1e55f74bdec212",
  lotteryPool: process.env.LOTTERY_POOL_ADDRESS ?? "0x9bb862643a73725e636dd7d7e30306844aa099f3",
  launchpad: process.env.HEDERA_GAME_LAUNCHPAD_ADDRESS ?? "0x54d13a05c632738674558f18de4394b7ee9a0399"
};

function normalizeAddress(raw: string, label: string): string {
  if (!raw) {
    throw new Error(`${label} is required`);
  }

  const value = raw.trim();

  if (ethers.isAddress(value)) {
    return ethers.getAddress(value);
  }

  const hederaPattern = /^\d+\.\d+\.\d+$/;
  if (hederaPattern.test(value)) {
    const solidityAddress = AccountId.fromString(value).toSolidityAddress();
    return ethers.getAddress(`0x${solidityAddress}`);
  }

  if (/^0x[0-9a-fA-F]{40}$/.test(value)) {
    return ethers.getAddress(value);
  }

  throw new Error(`Unsupported address format for ${label}: ${value}`);
}

function normalizeModuleAddresses(addresses: ModuleAddresses): ModuleAddresses {
  return {
    gameRegistry: normalizeAddress(addresses.gameRegistry, "GAME_REGISTRY_ADDRESS"),
    resultVerifier: normalizeAddress(addresses.resultVerifier, "RESULT_VERIFIER_ADDRESS"),
    playerSBT: normalizeAddress(addresses.playerSBT, "PLAYER_SBT_ADDRESS"),
    nftManager: normalizeAddress(addresses.nftManager, "NFT_MANAGER_ADDRESS"),
    tokenEconomy: normalizeAddress(addresses.tokenEconomy, "TOKEN_ECONOMY_ADDRESS"),
    faucetManager: normalizeAddress(addresses.faucetManager, "FAUCET_MANAGER_ADDRESS"),
    lotteryPool: normalizeAddress(addresses.lotteryPool, "LOTTERY_POOL_ADDRESS"),
    launchpad: normalizeAddress(addresses.launchpad, "HEDERA_GAME_LAUNCHPAD_ADDRESS")
  };
}

const METADATA_PATH = path.resolve(__dirname, "../metadata/shooter-game.json");
const GAME_ID = process.env.SHOOTER_GAME_ID ?? "shooter";

function loadMetadata(): { hash: string; uri: string } {
  if (!fs.existsSync(METADATA_PATH)) {
    throw new Error(`Metadata file not found: ${METADATA_PATH}`);
  }

  const jsonRaw = fs.readFileSync(METADATA_PATH, "utf8");
  const metadataUri = process.env.SHOOTER_METADATA_URI ?? "ipfs://placeholder-shooter-metadata";

  if (!metadataUri.startsWith("ipfs://")) {
    throw new Error("SHOOTER_METADATA_URI must be an ipfs:// URI");
  }

  return {
    hash: ethers.keccak256(ethers.toUtf8Bytes(jsonRaw)),
    uri: metadataUri
  };
}

function parseServerPublicKey(): string {
  const envKey = process.env.SHOOTER_SERVER_PUBLIC_KEY;

  if (envKey) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(envKey)) {
      throw new Error("SHOOTER_SERVER_PUBLIC_KEY must be a 0x-prefixed 32-byte hex string");
    }
    return envKey;
  }

  // Deterministic default based on metadata hash for reproducibility
  return ethers.keccak256(ethers.toUtf8Bytes(`${GAME_ID}:default-server-key`));
}

async function ensureLaunchpadHasOwnerRole(gameRegistry: Contract, launchpadAddress: string) {
  const hasOwnerRole: boolean = await gameRegistry.hasRole(OWNER_ROLE, launchpadAddress);

  if (hasOwnerRole) {
    console.log("✅ Launchpad already has OWNER role on GameRegistry");
    return;
  }

  console.log("🔑 Granting OWNER role on GameRegistry to launchpad", launchpadAddress);
  const tx = await gameRegistry.grantRole(OWNER_ROLE, launchpadAddress);
  await tx.wait();
  console.log("✅ OWNER role granted to launchpad");
}

async function ensureLaunchpadInitialized(launchpad: Contract, addresses: ModuleAddresses) {
  const initialized: boolean = await launchpad.systemInitialized();
  if (initialized) {
    console.log("✅ HederaGameLaunchpad is already initialized");
    return;
  }

  console.log("⚙️ Initializing HederaGameLaunchpad with linked contracts");
  const tx = await launchpad.initializeSystem(
    addresses.gameRegistry,
    addresses.resultVerifier,
    addresses.playerSBT,
    addresses.nftManager,
    addresses.tokenEconomy,
    addresses.faucetManager,
    addresses.lotteryPool
  );
  await tx.wait();
  console.log("✅ HederaGameLaunchpad initialized");
}

async function registerGameModule(
  gameRegistry: Contract,
  launchpad: Contract,
  metadataUri: string,
  serverAddress: string,
  serverPublicKey: string
) {
  const existing = await gameRegistry.getGameModule(GAME_ID);

  if (existing.isActive) {
    if (hashString(existing.metadataURI) === hashString(metadataUri)) {
      console.log(`ℹ️ Game '${GAME_ID}' already registered with the same metadata URI (${existing.metadataURI}). Skipping.`);
      return;
    }

    console.log(`ℹ️ Game '${GAME_ID}' is active with outdated metadata (${existing.metadataURI}); updating to ${metadataUri}`);

    await revokeExistingGame(gameRegistry);
  }

  console.log(`📝 Registering shooter game '${GAME_ID}' with metadata ${metadataUri}`);

  const tx = await launchpad.registerGameModule(
    serverAddress,
    serverPublicKey,
    GAME_ID,
    metadataUri
  );

  await tx.wait();
  console.log("✅ Shooter game registered");
}

function hashString(value: string): string {
  if (!value) {
    return ethers.ZeroHash;
  }

  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

async function revokeExistingGame(gameRegistry: Contract) {
  try {
    console.log("🚫 Revoking existing shooter game module before re-registration");
    const tx = await gameRegistry.revokeGameModule(GAME_ID);
    await tx.wait();
    console.log("✅ Shooter game module revoked");
  } catch (error) {
    console.error("❌ Failed to revoke existing shooter game module. Ensure the signer has OWNER role on GameRegistry.", error);
    throw error;
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Shooter game registration");
  console.log("Signer:", deployer.address);

  console.log("Configured contract addresses (raw):");
  console.table(RAW_ADDRESSES);

  const addresses = normalizeModuleAddresses(RAW_ADDRESSES);
  console.log("Resolved EVM addresses:");
  console.table(addresses);

  const { hash: metadataHash, uri: metadataUri } = loadMetadata();
  console.log("🧾 Local metadata hash:", metadataHash);
  console.log("🌐 Metadata URI:", metadataUri);

  const serverAddress = normalizeAddress(
    process.env.SHOOTER_SERVER_ADDRESS ?? deployer.address,
    "SHOOTER_SERVER_ADDRESS"
  );
  const serverPublicKey = parseServerPublicKey();

  console.log("🎮 Shooter server address:", serverAddress);
  console.log("🔐 Shooter server public key:", serverPublicKey);

  const gameRegistry = await ethers.getContractAt("GameRegistry", addresses.gameRegistry);
  const launchpad = await ethers.getContractAt("HederaGameLaunchpad", addresses.launchpad);

  await ensureLaunchpadHasOwnerRole(gameRegistry, addresses.launchpad);
  await ensureLaunchpadInitialized(launchpad, addresses);

  await registerGameModule(gameRegistry, launchpad, metadataUri, serverAddress, serverPublicKey);

  console.log("🎯 Shooter registration flow completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Shooter registration failed", error);
    process.exit(1);
  });

