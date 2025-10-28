import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing HederaGameLaunchpad interactions...");

  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:");
  console.log("Deployer:", deployer.address);

  // Use the deployed contract address from the last deployment
  const mainContractAddress = "0x54d13a05C632738674558f18De4394b7Ee9A0399";
  console.log("Using main contract:", mainContractAddress);

  const HederaGameLaunchpad = await ethers.getContractFactory("HederaGameLaunchpad");
  const mainContract = HederaGameLaunchpad.attach(mainContractAddress);

  try {
    // 1. Test system status
    console.log("\n🔍 Checking system status...");
    const isOperational = await mainContract.isSystemOperational();
    console.log("System Operational:", isOperational);

    const systemStats = await mainContract.getSystemStats();
    console.log("System Stats:", {
      gamesPlayed: systemStats.gamesPlayed.toString(),
      players: systemStats.players.toString(),
      rewardsDistributed: systemStats.rewardsDistributed.toString(),
      poolBalance: ethers.formatEther(systemStats.poolBalance),
      totalParticipants: systemStats.totalParticipants.toString(),
      initialized: systemStats.initialized
    });

    // 2. Test player SBT minting
    console.log("\n👤 Testing player SBT minting...");
    const tokenURI = "ipfs://QmPlayerSBTMetadata";
    
    try {
      const tx = await mainContract.connect(deployer).mintPlayerSBT(deployer.address, tokenURI);
      await tx.wait();
      console.log("✅ Player SBT minted for player 1");
    } catch (error) {
      console.log("❌ Player SBT minting failed (expected - needs game server role):", error.message);
    }

    // 3. Test HBAR to HPLAY swap
    console.log("\n🚰 Testing HBAR to HPLAY swap...");
    const swapAmount = ethers.parseEther("0.1"); // 0.1 HBAR
    
    try {
      const tx = await mainContract.connect(deployer).swapHBARforHPLAY({ value: swapAmount });
      const receipt = await tx.wait();
      console.log("✅ HBAR to HPLAY swap successful");
      console.log("Gas used:", receipt.gasUsed.toString());
    } catch (error) {
      console.log("❌ HBAR to HPLAY swap failed:", error.message);
    }

    // 4. Check player HPLAY balance
    console.log("\n💰 Checking player HPLAY balance...");
    const tokenEconomy = await ethers.getContractAt("TokenEconomy", await mainContract.tokenEconomy());
    const balance = await tokenEconomy.balanceOf(deployer.address);
    console.log("Player 1 HPLAY balance:", ethers.formatEther(balance));

    // 5. Test game result submission (simulation)
    console.log("\n🎮 Testing game result submission...");
    const gameId = "sample-quiz-game";
    const score = 2500;
    const nonce = 1;
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create a mock signature (in production, this would be from the game server)
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ["address", "string", "uint256", "uint256", "uint256"],
        [deployer.address, gameId, score, timestamp, nonce]
      )
    );
    
    const signature = await deployer.signMessage(ethers.getBytes(messageHash));
    
    try {
      const tx = await mainContract.connect(deployer).submitGameResult(
        deployer.address,
        gameId,
        score,
        signature,
        nonce,
        timestamp
      );
      await tx.wait();
      console.log("✅ Game result submitted successfully");
    } catch (error) {
      console.log("❌ Game result submission failed:", error.message);
    }

    // 6. Test NFT achievement minting
    console.log("\n🎨 Testing NFT achievement minting...");
    try {
      const tx = await mainContract.connect(deployer).mintAchievementNFT(
        deployer.address,
        "rare",
        "ipfs://QmAchievementNFTMetadata"
      );
      await tx.wait();
      console.log("✅ Achievement NFT minted successfully");
    } catch (error) {
      console.log("❌ Achievement NFT minting failed:", error.message);
    }

    // 7. Check player NFT count
    console.log("\n🎨 Checking player NFT count...");
    const nftManager = await ethers.getContractAt("NFTManager", await mainContract.nftManager());
    const nftCount = await nftManager.getPlayerNFTCount(deployer.address);
    console.log("Player NFT count:", nftCount.toString());

    // 8. Test lottery pool status
    console.log("\n🎲 Checking lottery pool status...");
    const lotteryPool = await ethers.getContractAt("LotteryPool", await mainContract.lotteryPool());
    const poolBalance = await lotteryPool.getPoolBalance();
    const totalParticipants = await lotteryPool.getTotalParticipants();
    const timeUntilNextDraw = await lotteryPool.getTimeUntilNextDraw();
    
    console.log("Lottery Pool Status:", {
      balance: ethers.formatEther(poolBalance),
      participants: totalParticipants.toString(),
      timeUntilNextDraw: timeUntilNextDraw.toString()
    });

    // 9. Test player info retrieval
    console.log("\n👤 Getting player information...");
    const playerInfo = await mainContract.getPlayerInfo(deployer.address);
    console.log("Player Info:", {
      hasSBT: playerInfo.hasSBT,
      totalGamesPlayed: playerInfo.stats.totalGamesPlayed.toString(),
      totalWins: playerInfo.stats.totalWins.toString(),
      totalPoints: playerInfo.stats.totalPoints.toString(),
      nftCount: playerInfo.nftCount.toString(),
      hplayBalance: ethers.formatEther(playerInfo.hplayBalance)
    });

    // 10. Test contract addresses retrieval
    console.log("\n📍 Getting contract addresses...");
    const addresses = await mainContract.getContractAddresses();
    console.log("Contract Addresses:", {
      gameRegistry: addresses[0],
      resultVerifier: addresses[1],
      playerSBT: addresses[2],
      nftManager: addresses[3],
      tokenEconomy: addresses[4],
      faucetManager: addresses[5],
      lotteryPool: addresses[6]
    });

    console.log("\n🎉 Testing completed!");
    console.log("\n📋 Test Summary:");
    console.log("✅ System status checked");
    console.log("✅ Player SBT minting tested");
    console.log("✅ HBAR to HPLAY swap tested");
    console.log("✅ Game result submission tested");
    console.log("✅ NFT achievement minting tested");
    console.log("✅ Lottery pool status checked");
    console.log("✅ Player information retrieved");
    console.log("✅ Contract addresses retrieved");

  } catch (error) {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

