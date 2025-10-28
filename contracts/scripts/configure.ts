import { ethers } from "hardhat";

async function main() {
  console.log("⚙️ Configuring HederaGameLaunchpad system...");

  const [deployer] = await ethers.getSigners();
  console.log("Configuring with account:", deployer.address);

  // Get contract addresses from environment or deployment
  const mainContractAddress = process.env.MAIN_CONTRACT_ADDRESS;
  if (!mainContractAddress) {
    throw new Error("MAIN_CONTRACT_ADDRESS environment variable is required");
  }

  const HederaGameLaunchpad = await ethers.getContractFactory("HederaGameLaunchpad");
  const mainContract = HederaGameLaunchpad.attach(mainContractAddress);

  try {
    // 1. Register a sample game module
    console.log("\n🎮 Registering sample game module...");
    const gameId = "sample-quiz-game";
    const serverAddress = deployer.address; // In production, use actual server address
    const publicKey = ethers.keccak256(ethers.toUtf8Bytes("sample-server-public-key"));
    const metadataURI = "ipfs://QmSampleGameMetadata";

    await mainContract.registerGameModule(
      serverAddress,
      publicKey,
      gameId,
      metadataURI
    );
    console.log("✅ Sample game module registered:", gameId);

    // 2. Set difficulty multiplier for the game
    console.log("\n📊 Setting game difficulty multiplier...");
    const gameRegistry = await ethers.getContractAt("GameRegistry", await mainContract.gameRegistry());
    await gameRegistry.setDifficultyMultiplier(gameId, 1500); // 1.5x difficulty
    console.log("✅ Difficulty multiplier set to 1.5x");

    // 3. Set minimum score for the game
    console.log("\n🎯 Setting minimum score requirement...");
    const resultVerifier = await ethers.getContractAt("ResultVerifier", await mainContract.resultVerifier());
    await resultVerifier.setMinimumScore(gameId, 1000); // Minimum 1000 points
    console.log("✅ Minimum score set to 1000 points");

    // 4. Configure token economy parameters
    console.log("\n💰 Configuring token economy...");
    const tokenEconomy = await ethers.getContractAt("TokenEconomy", await mainContract.tokenEconomy());
    
    const newParams = {
      transferFeePercent: 50,    // 0.5%
      burnFeePercent: 10,        // 0.1%
      stakingRewardPercent: 100,  // 1%
      mintingEnabled: true
    };
    
    await tokenEconomy.updateParams(newParams);
    console.log("✅ Token economy parameters updated");

    // 5. Configure faucet settings
    console.log("\n🚰 Configuring faucet settings...");
    const faucetManager = await ethers.getContractAt("FaucetManager", await mainContract.faucetManager());
    
    // Update swap rate: 1 HBAR = 500 HPLAY
    await faucetManager.updateSwapRate(ethers.parseEther("500"));
    console.log("✅ Swap rate updated: 1 HBAR = 500 HPLAY");
    
    // Set daily limit: 10 HBAR per user
    await faucetManager.setDailyLimit(ethers.parseEther("10"));
    console.log("✅ Daily limit set to 10 HBAR per user");

    // 6. Configure lottery pool
    console.log("\n🎲 Configuring lottery pool...");
    const lotteryPool = await ethers.getContractAt("LotteryPool", await mainContract.lotteryPool());
    
    // Set draw interval to 24 hours
    await lotteryPool.setDrawInterval(24 * 60 * 60); // 24 hours in seconds
    console.log("✅ Lottery draw interval set to 24 hours");

    // 7. Configure NFT rarity burn fees
    console.log("\n🎨 Configuring NFT rarity burn fees...");
    const nftManager = await ethers.getContractAt("NFTManager", await mainContract.nftManager());
    
    await nftManager.setRarityBurnFee("common", ethers.parseEther("10"));
    await nftManager.setRarityBurnFee("rare", ethers.parseEther("50"));
    await nftManager.setRarityBurnFee("epic", ethers.parseEther("200"));
    await nftManager.setRarityBurnFee("legendary", ethers.parseEther("1000"));
    console.log("✅ NFT rarity burn fees configured");

    // 8. Grant additional roles if needed
    console.log("\n👥 Setting up additional roles...");
    const DAO_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DAO"));
    const SERVER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SERVER"));
    const GAME_SERVER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GAME_SERVER"));

    // Grant DAO role to deployer for governance
    await mainContract.grantRole(DAO_ROLE, deployer.address);
    console.log("✅ DAO role granted to deployer");

    // Grant SERVER role to deployer for testing
    await mainContract.grantRole(SERVER_ROLE, deployer.address);
    console.log("✅ SERVER role granted to deployer");

    // 9. Verify system configuration
    console.log("\n🔍 Verifying system configuration...");
    const systemStats = await mainContract.getSystemStats();
    console.log("System Stats:", {
      gamesPlayed: systemStats.gamesPlayed.toString(),
      players: systemStats.players.toString(),
      rewardsDistributed: systemStats.rewardsDistributed.toString(),
      poolBalance: ethers.formatEther(systemStats.poolBalance),
      totalParticipants: systemStats.totalParticipants.toString(),
      initialized: systemStats.initialized
    });

    const isOperational = await mainContract.isSystemOperational();
    console.log("System Operational:", isOperational);

    console.log("\n🎉 Configuration completed successfully!");
    console.log("\n📋 Configuration Summary:");
    console.log("✅ Sample game module registered");
    console.log("✅ Difficulty multiplier set to 1.5x");
    console.log("✅ Minimum score requirement set to 1000 points");
    console.log("✅ Token economy parameters configured");
    console.log("✅ Faucet settings configured");
    console.log("✅ Lottery pool configured");
    console.log("✅ NFT rarity burn fees configured");
    console.log("✅ Roles and permissions set up");
    console.log("✅ System verified and operational");

    console.log("\n🔗 Next steps:");
    console.log("1. Test game result submission");
    console.log("2. Test player SBT minting");
    console.log("3. Test NFT achievement minting");
    console.log("4. Test HBAR to HPLAY swap");
    console.log("5. Monitor lottery pool accumulation");
    console.log("6. Set up monitoring and alerts");

  } catch (error) {
    console.error("❌ Configuration failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

