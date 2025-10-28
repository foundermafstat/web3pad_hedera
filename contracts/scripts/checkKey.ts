import "dotenv/config";
import { ethers } from "hardhat";

async function checkPrivateKey() {
  const privateKey = process.env.PRIVATE_KEY;
  
  console.log("🔍 Checking private key format...");
  console.log("Key length:", privateKey?.length);
  console.log("Key starts with:", privateKey?.substring(0, 10));
  
  if (!privateKey) {
    console.error("❌ No PRIVATE_KEY found in environment variables");
    return;
  }
  
  // Check different formats
  if (privateKey.startsWith('302e0201')) {
    console.log("✅ Hedera DER format detected");
    console.log("⚠️ This format needs conversion for Hardhat");
    console.log("💡 Please use an Ethereum-compatible private key (64 characters)");
  } else if (privateKey.length === 64) {
    console.log("✅ Ethereum format detected (64 characters)");
    try {
      const wallet = new ethers.Wallet(privateKey);
      console.log("✅ Valid Ethereum private key");
      console.log("Address:", wallet.address);
    } catch (error) {
      console.error("❌ Invalid Ethereum private key:", error.message);
    }
  } else if (privateKey.startsWith('0x') && privateKey.length === 66) {
    console.log("✅ Ethereum format with 0x prefix detected");
    const cleanKey = privateKey.slice(2);
    try {
      const wallet = new ethers.Wallet(cleanKey);
      console.log("✅ Valid Ethereum private key");
      console.log("Address:", wallet.address);
    } catch (error) {
      console.error("❌ Invalid Ethereum private key:", error.message);
    }
  } else {
    console.error("❌ Unknown private key format");
    console.log("Expected formats:");
    console.log("- Ethereum: 64 characters (hex)");
    console.log("- Ethereum with 0x: 66 characters");
    console.log("- Hedera DER: starts with 302e0201");
  }
}

checkPrivateKey().catch(console.error);
