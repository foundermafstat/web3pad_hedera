import "dotenv/config";
import { ethers } from "hardhat";
import { AccountId } from "@hashgraph/sdk";
import fs from "fs";
import path from "path";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface ShooterNFTConfig {
  id: string;
  rarity: Rarity;
  metadataFile: string;
}

const DEFAULT_LAUNCHPAD_ADDRESS = "0x54d13a05C632738674558f18De4394b7Ee9A0399";
const DEFAULT_NFT_MANAGER_ADDRESS = "0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860";
const DEFAULT_RECIPIENT_ADDRESS = process.env.NFT_MINT_RECIPIENT ?? process.env.SHOOTER_SERVER_ADDRESS;

const shooterNFTs: ShooterNFTConfig[] = [
  {
    id: "shooter_weapon_overclocked_pulse_carbine",
    rarity: "epic",
    metadataFile: "shooter-weapon-overclocked-pulse-carbine.json",
  },
  {
    id: "shooter_armor_reactive_vest",
    rarity: "rare",
    metadataFile: "shooter-armor-reactive-vest.json",
  },
  {
    id: "shooter_achievement_first_blood",
    rarity: "common",
    metadataFile: "shooter-achievement-first-blood.json",
  },
];

function isHederaAccount(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function normalizeAddressInput(raw: string | undefined, label: string, fallback?: string): string {
  if (!raw || raw.trim().length === 0) {
    if (fallback) {
      return fallback;
    }
    throw new Error(`${label} is required`);
  }

  const value = raw.trim();

  if (ethers.isAddress(value)) {
    return ethers.getAddress(value);
  }

  if (isHederaAccount(value)) {
    const solidityAddress = AccountId.fromString(value).toSolidityAddress();
    return ethers.getAddress(`0x${solidityAddress}`);
  }

  if (/^0x[0-9a-fA-F]{40}$/.test(value)) {
    return ethers.getAddress(value);
  }

  throw new Error(`Unsupported address format for ${label}: ${value}`);
}

function resolveRecipientAddress(defaultSigner: string): string {
  const envRecipient = DEFAULT_RECIPIENT_ADDRESS;
  if (envRecipient && envRecipient.trim().length > 0) {
    return normalizeAddressInput(envRecipient, "NFT_MINT_RECIPIENT", defaultSigner);
  }
  return defaultSigner;
}

function loadMetadata(metadataFile: string): string {
  const metadataPath = path.resolve(__dirname, "../metadata", metadataFile);

  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata file not found: ${metadataPath}`);
  }

  const raw = fs.readFileSync(metadataPath, "utf8");
  const json = JSON.parse(raw);
  const base64 = Buffer.from(JSON.stringify(json)).toString("base64");
  return `data:application/json;base64,${base64}`;
}

async function main() {
  const [signer] = await ethers.getSigners();

  if (!signer) {
    throw new Error("No signer available. Ensure PRIVATE_KEY is configured in the environment.");
  }

  const launchpadAddress = normalizeAddressInput(
    process.env.HEDERA_GAME_LAUNCHPAD_ADDRESS ?? DEFAULT_LAUNCHPAD_ADDRESS,
    "HEDERA_GAME_LAUNCHPAD_ADDRESS",
  );

  const nftManagerAddress = normalizeAddressInput(
    process.env.NFT_MANAGER_ADDRESS ?? DEFAULT_NFT_MANAGER_ADDRESS,
    "NFT_MANAGER_ADDRESS",
  );

  if (!ethers.isAddress(launchpadAddress)) {
    throw new Error(`Invalid HederaGameLaunchpad address: ${launchpadAddress}`);
  }

  if (!ethers.isAddress(nftManagerAddress)) {
    throw new Error(`Invalid NFTManager address: ${nftManagerAddress}`);
  }

  const recipient = resolveRecipientAddress(signer.address);
  const launchpad = await ethers.getContractAt("HederaGameLaunchpad", launchpadAddress, signer);
  const nftManager = await ethers.getContractAt("NFTManager", nftManagerAddress, signer);

  console.log("🚀 Minting shooter NFTs");
  console.log("Signer:", signer.address);
  console.log("Recipient:", recipient);
  console.log("Launchpad:", launchpadAddress);
  console.log("NFTManager:", nftManagerAddress);

  const GAME_SERVER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GAME_SERVER"));
  const systemInitialized = await launchpad.systemInitialized();
  console.log("System initialized:", systemInitialized);

  if (!systemInitialized) {
    throw new Error("HederaGameLaunchpad system is not initialized. Run register/setup scripts first.");
  }

  const hasGameServerRole = await launchpad.hasRole(GAME_SERVER_ROLE, signer.address);
  if (!hasGameServerRole) {
    console.log("🔑 Granting GAME_SERVER_ROLE to signer...");
    const grantTx = await launchpad.grantRole(GAME_SERVER_ROLE, signer.address);
    await grantTx.wait();
    console.log("✅ GAME_SERVER_ROLE granted to signer");
  }

  const minted: Array<{ id: string; rarity: Rarity; tokenId: bigint; txHash: string }> = [];

  for (const asset of shooterNFTs) {
    console.log(`\n🎯 Processing ${asset.id} (${asset.rarity})`);

    const metadataURI = loadMetadata(asset.metadataFile);

    const tx = await launchpad.mintAchievementNFT(recipient, asset.rarity, metadataURI, {
      gasLimit: process.env.GAS_LIMIT ? BigInt(process.env.GAS_LIMIT) : 5_000_000n,
    });

    console.log("⏳ Waiting for transaction...", tx.hash);
    const receipt = await tx.wait();

    let mintedTokenId: bigint | null = null;

    for (const log of receipt.logs) {
      try {
        const parsed = nftManager.interface.parseLog(log);
        if (parsed && parsed.name === "NFTMinted") {
          mintedTokenId = parsed.args.tokenId as bigint;
          break;
        }
      } catch (error) {
        // Ignore logs that do not belong to NFTManager
      }
    }

    if (mintedTokenId === null) {
      const total = await nftManager.getTotalNFTs();
      mintedTokenId = total - 1n;
    }

    console.log("✅ Minted", asset.id, "tokenId:", mintedTokenId.toString());
    minted.push({ id: asset.id, rarity: asset.rarity, tokenId: mintedTokenId, txHash: receipt.hash });
  }

  console.table(
    minted.map((entry) => ({
      id: entry.id,
      rarity: entry.rarity,
      tokenId: entry.tokenId.toString(),
      txHash: entry.txHash,
    })),
  );

  console.log("🎉 Shooter NFTs minted successfully");
}

main().catch((error) => {
  console.error("❌ Minting shooter NFTs failed", error);
  process.exit(1);
});

