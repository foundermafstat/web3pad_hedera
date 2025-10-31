import "dotenv/config";
import { ethers } from "hardhat";
import { AccountId } from "@hashgraph/sdk";

const DEFAULT_NFT_MANAGER_ADDRESS = "0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860";
const TARGET_ADDRESS = process.env.SHOOTER_NFT_OWNER ?? "0x3263874809c13d364dEA26a89b1232268935e8eC";

function isHederaAccount(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function normalizeAddress(raw: string, label: string): string {
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

async function main() {
  const nftManagerAddress = normalizeAddress(
    process.env.NFT_MANAGER_ADDRESS ?? DEFAULT_NFT_MANAGER_ADDRESS,
    "NFT_MANAGER_ADDRESS",
  );

  const ownerAddress = normalizeAddress(TARGET_ADDRESS, "SHOOTER_NFT_OWNER");

  const nftManager = await ethers.getContractAt("NFTManager", nftManagerAddress);

  const tokenIds = await nftManager.getPlayerNFTs(ownerAddress);
  console.log("Player NFT IDs:", tokenIds.map((id: bigint) => id.toString()));

  for (const tokenId of tokenIds) {
    const metadataURI = await nftManager.tokenURI(tokenId);
    const nft = await nftManager.getNFT(tokenId);
    console.log(`\nToken ${tokenId.toString()}:`);
    console.log("  Owner:", nft.owner);
    console.log("  Rarity:", nft.achievementType);
    console.log("  Metadata URI:", metadataURI);
  }
}

main().catch((error) => {
  console.error("Failed to read shooter NFTs", error);
  process.exit(1);
});

