import { ethers } from "hardhat";

/**
 * Deploy complete V2 system:
 * 1. TokenEconomyV2 (simple token without fees)
 * 2. FaucetManagerV2 (mints tokens directly)
 * 3. Grant MINTER_ROLE to FaucetManager
 */
async function main() {
  console.log("\n🚀 Deploying V2 System...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "HBAR\n");
  
  // Step 1: Deploy TokenEconomyV2
  console.log("📦 1/3: Deploying TokenEconomyV2...");
  const TokenEconomyV2 = await ethers.getContractFactory("TokenEconomyV2");
  const tokenEconomy = await TokenEconomyV2.deploy();
  await tokenEconomy.waitForDeployment();
  const tokenAddress = await tokenEconomy.getAddress();
  console.log("✅ TokenEconomyV2 deployed at:", tokenAddress);
  
  // Step 2: Deploy FaucetManagerV2
  console.log("\n📦 2/3: Deploying FaucetManagerV2...");
  const FaucetManagerV2 = await ethers.getContractFactory("FaucetManagerV2");
  const faucetManager = await FaucetManagerV2.deploy(tokenAddress);
  await faucetManager.waitForDeployment();
  const faucetAddress = await faucetManager.getAddress();
  console.log("✅ FaucetManagerV2 deployed at:", faucetAddress);
  
  // Step 3: Grant MINTER_ROLE to FaucetManager
  console.log("\n🔑 3/3: Granting MINTER_ROLE to FaucetManager...");
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const grantTx = await tokenEconomy.grantRole(MINTER_ROLE, faucetAddress);
  await grantTx.wait();
  console.log("✅ MINTER_ROLE granted!");
  
  // Verify roles
  console.log("\n🔍 Verifying roles...");
  const hasMinterRole = await tokenEconomy.hasRole(MINTER_ROLE, faucetAddress);
  console.log("   FaucetManager has MINTER_ROLE:", hasMinterRole);
  
  // Get swap rate
  const swapRate = await faucetManager.getSwapRate();
  console.log("\n⚙️ FaucetManager Configuration:");
  console.log("   Rate:", ethers.formatUnits(swapRate.hbarToHplayRate, 8), "HPLAY per HBAR");
  console.log("   Daily Limit:", ethers.formatUnits(swapRate.dailyLimitHbar, 8), "HBAR");
  console.log("   Enabled:", swapRate.enabled);
  
  // Save deployment info
  const deploymentInfo = {
    network: "hedera_testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      TokenEconomyV2: tokenAddress,
      FaucetManagerV2: faucetAddress
    },
    roles: {
      MINTER_ROLE: MINTER_ROLE,
      faucetHasMinterRole: hasMinterRole
    },
    swapRate: {
      hbarToHplayRate: swapRate.hbarToHplayRate.toString(),
      dailyLimitHbar: swapRate.dailyLimitHbar.toString(),
      enabled: swapRate.enabled
    }
  };
  
  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file
  const fs = require("fs");
  const path = require("path");
  const deployDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  
  const filename = `v2-deployment-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deployDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n✅ Deployment info saved to: deployments/${filename}`);
  
  console.log("\n🎯 Next Steps:");
  console.log("   1. Update server/lib/hedera-config.js:");
  console.log(`      TOKEN_ECONOMY_ADDRESS: "${tokenAddress}"`);
  console.log(`      FAUCET_MANAGER_ADDRESS: "${faucetAddress}"`);
  console.log("   2. Restart server");
  console.log("   3. Test swap!");
  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

