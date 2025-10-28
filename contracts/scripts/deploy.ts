import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface ContractAddresses {
  gameRegistry: string;
  resultVerifier: string;
  playerSBT: string;
  nftManager: string;
  tokenEconomy: string;
  faucetManager: string;
  lotteryPool: string;
  mainContract: string;
}

async function main() {
  console.log("🚀 Starting HederaGameLaunchpad deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  const contractAddresses: ContractAddresses = {
    gameRegistry: "",
    resultVerifier: "",
    playerSBT: "",
    nftManager: "",
    tokenEconomy: "",
    faucetManager: "",
    lotteryPool: "",
    mainContract: ""
  };

  try {
    // 1. Deploy GameRegistry
    console.log("\n📋 Deploying GameRegistry...");
    const GameRegistry = await ethers.getContractFactory("GameRegistry");
    const gameRegistry = await GameRegistry.deploy();
    await gameRegistry.waitForDeployment();
    contractAddresses.gameRegistry = await gameRegistry.getAddress();
    console.log("✅ GameRegistry deployed to:", contractAddresses.gameRegistry);

    // 2. Deploy TokenEconomy
    console.log("\n💰 Deploying TokenEconomy...");
    const TokenEconomy = await ethers.getContractFactory("TokenEconomy");
    const tokenEconomy = await TokenEconomy.deploy(ethers.ZeroAddress); // Will be updated later
    await tokenEconomy.waitForDeployment();
    contractAddresses.tokenEconomy = await tokenEconomy.getAddress();
    console.log("✅ TokenEconomy deployed to:", contractAddresses.tokenEconomy);

    // 3. Deploy LotteryPool
    console.log("\n🎲 Deploying LotteryPool...");
    const LotteryPool = await ethers.getContractFactory("LotteryPool");
    const lotteryPool = await LotteryPool.deploy(contractAddresses.tokenEconomy);
    await lotteryPool.waitForDeployment();
    contractAddresses.lotteryPool = await lotteryPool.getAddress();
    console.log("✅ LotteryPool deployed to:", contractAddresses.lotteryPool);

    // 4. Update TokenEconomy with LotteryPool address
    console.log("\n🔄 Updating TokenEconomy with LotteryPool address...");
    await tokenEconomy.updateLotteryPool(contractAddresses.lotteryPool);
    console.log("✅ TokenEconomy updated");

    // 5. Deploy PlayerSBT
    console.log("\n👤 Deploying PlayerSBT...");
    const PlayerSBT = await ethers.getContractFactory("PlayerSBT");
    const playerSBT = await PlayerSBT.deploy(contractAddresses.gameRegistry);
    await playerSBT.waitForDeployment();
    contractAddresses.playerSBT = await playerSBT.getAddress();
    console.log("✅ PlayerSBT deployed to:", contractAddresses.playerSBT);

    // 6. Deploy NFTManager
    console.log("\n🎨 Deploying NFTManager...");
    const NFTManager = await ethers.getContractFactory("NFTManager");
    const nftManager = await NFTManager.deploy(contractAddresses.tokenEconomy);
    await nftManager.waitForDeployment();
    contractAddresses.nftManager = await nftManager.getAddress();
    console.log("✅ NFTManager deployed to:", contractAddresses.nftManager);

    // 7. Deploy FaucetManager
    console.log("\n🚰 Deploying FaucetManager...");
    const FaucetManager = await ethers.getContractFactory("FaucetManager");
    const faucetManager = await FaucetManager.deploy(contractAddresses.tokenEconomy);
    await faucetManager.waitForDeployment();
    contractAddresses.faucetManager = await faucetManager.getAddress();
    console.log("✅ FaucetManager deployed to:", contractAddresses.faucetManager);

    // 8. Deploy ResultVerifier
    console.log("\n🔐 Deploying ResultVerifier...");
    const ResultVerifier = await ethers.getContractFactory("ResultVerifier");
    const resultVerifier = await ResultVerifier.deploy(
      contractAddresses.gameRegistry,
      contractAddresses.playerSBT,
      contractAddresses.tokenEconomy
    );
    await resultVerifier.waitForDeployment();
    contractAddresses.resultVerifier = await resultVerifier.getAddress();
    console.log("✅ ResultVerifier deployed to:", contractAddresses.resultVerifier);

    // 9. Deploy main HederaGameLaunchpad contract
    console.log("\n🎮 Deploying HederaGameLaunchpad...");
    const HederaGameLaunchpad = await ethers.getContractFactory("HederaGameLaunchpad");
    const mainContract = await HederaGameLaunchpad.deploy();
    await mainContract.waitForDeployment();
    contractAddresses.mainContract = await mainContract.getAddress();
    console.log("✅ HederaGameLaunchpad deployed to:", contractAddresses.mainContract);

    // 10. Initialize the main contract
    console.log("\n⚙️ Initializing HederaGameLaunchpad...");
    await mainContract.initializeSystem(
      contractAddresses.gameRegistry,
      contractAddresses.resultVerifier,
      contractAddresses.playerSBT,
      contractAddresses.nftManager,
      contractAddresses.tokenEconomy,
      contractAddresses.faucetManager,
      contractAddresses.lotteryPool
    );
    console.log("✅ HederaGameLaunchpad initialized");

    // 11. Distribute initial token supply
    console.log("\n💸 Distributing initial token supply...");
    const distribution = {
      gameRewardsPool: contractAddresses.mainContract, // Use main contract as rewards pool
      developerIncentives: deployer.address,
      daoTreasury: deployer.address,
      marketingEvents: deployer.address,
      liquidityReserve: contractAddresses.faucetManager
    };
    
    await tokenEconomy.distributeInitialSupply(distribution);
    console.log("✅ Initial token supply distributed");

    // 12. Deposit initial HPLAY to faucet
    console.log("\n🚰 Depositing initial HPLAY to faucet...");
    const faucetDepositAmount = ethers.parseEther("1000000"); // 1M HPLAY
    
    // Check deployer's token balance first
    const deployerBalance = await tokenEconomy.balanceOf(deployer.address);
    console.log("Deployer token balance:", ethers.formatEther(deployerBalance));
    
    if (deployerBalance >= faucetDepositAmount) {
      await tokenEconomy.transfer(contractAddresses.faucetManager, faucetDepositAmount);
      console.log("✅ Initial HPLAY deposited to faucet");
    } else {
      console.log("⚠️ Insufficient token balance for faucet deposit. Skipping...");
      console.log("Available:", ethers.formatEther(deployerBalance));
      console.log("Required:", ethers.formatEther(faucetDepositAmount));
    }

    // 13. Set up roles
    console.log("\n👥 Setting up roles...");
    const DAO_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DAO"));
    const SERVER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SERVER"));
    const GAME_SERVER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GAME_SERVER"));

    // Grant roles to main contract
    await gameRegistry.grantRole(DAO_ROLE, contractAddresses.mainContract);
    await resultVerifier.grantRole(GAME_SERVER_ROLE, contractAddresses.mainContract);
    await playerSBT.grantRole(GAME_SERVER_ROLE, contractAddresses.mainContract);
    await nftManager.grantRole(GAME_SERVER_ROLE, contractAddresses.mainContract);
    await tokenEconomy.grantRole(GAME_SERVER_ROLE, contractAddresses.mainContract);
    await faucetManager.grantRole(DAO_ROLE, contractAddresses.mainContract);
    await lotteryPool.grantRole(DAO_ROLE, contractAddresses.mainContract);

    console.log("✅ Roles set up");

    // 14. Save deployment info
    console.log("\n💾 Saving deployment information...");
    const deploymentInfo = {
      network: await ethers.provider.getNetwork(),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: contractAddresses
    };

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("GameRegistry:", contractAddresses.gameRegistry);
    console.log("ResultVerifier:", contractAddresses.resultVerifier);
    console.log("PlayerSBT:", contractAddresses.playerSBT);
    console.log("NFTManager:", contractAddresses.nftManager);
    console.log("TokenEconomy:", contractAddresses.tokenEconomy);
    console.log("FaucetManager:", contractAddresses.faucetManager);
    console.log("LotteryPool:", contractAddresses.lotteryPool);
    console.log("HederaGameLaunchpad:", contractAddresses.mainContract);

    console.log("\n🔗 Next steps:");
    console.log("1. Verify contracts on block explorer");
    console.log("2. Register game modules using GameRegistry");
    console.log("3. Set up game servers with proper signatures");
    console.log("4. Test the faucet functionality");
    console.log("5. Monitor lottery pool accumulation");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

