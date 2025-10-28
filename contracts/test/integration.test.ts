import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HederaGameLaunchpad } from "../typechain-types";

describe("HederaGameLaunchpad Integration", function () {
  let mainContract: HederaGameLaunchpad;
  let gameRegistry: any;
  let resultVerifier: any;
  let playerSBT: any;
  let nftManager: any;
  let tokenEconomy: any;
  let faucetManager: any;
  let lotteryPool: any;
  
  let owner: HardhatEthersSigner;
  let player: HardhatEthersSigner;
  let gameServer: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, player, gameServer, otherAccount] = await ethers.getSigners();

    // Deploy all contracts
    const GameRegistry = await ethers.getContractFactory("GameRegistry");
    gameRegistry = await GameRegistry.deploy();
    await gameRegistry.waitForDeployment();

    const LotteryPool = await ethers.getContractFactory("LotteryPool");
    lotteryPool = await LotteryPool.deploy(ethers.ZeroAddress);
    await lotteryPool.waitForDeployment();

    const TokenEconomy = await ethers.getContractFactory("TokenEconomy");
    tokenEconomy = await TokenEconomy.deploy(await lotteryPool.getAddress());
    await tokenEconomy.waitForDeployment();

    const PlayerSBT = await ethers.getContractFactory("PlayerSBT");
    playerSBT = await PlayerSBT.deploy(await gameRegistry.getAddress());
    await playerSBT.waitForDeployment();

    const NFTManager = await ethers.getContractFactory("NFTManager");
    nftManager = await NFTManager.deploy(await tokenEconomy.getAddress());
    await nftManager.waitForDeployment();

    const FaucetManager = await ethers.getContractFactory("FaucetManager");
    faucetManager = await FaucetManager.deploy(await tokenEconomy.getAddress());
    await faucetManager.waitForDeployment();

    const ResultVerifier = await ethers.getContractFactory("ResultVerifier");
    resultVerifier = await ResultVerifier.deploy(
      await gameRegistry.getAddress(),
      await playerSBT.getAddress(),
      await tokenEconomy.getAddress()
    );
    await resultVerifier.waitForDeployment();

    const HederaGameLaunchpad = await ethers.getContractFactory("HederaGameLaunchpad");
    mainContract = await HederaGameLaunchpad.deploy();
    await mainContract.waitForDeployment();

    // Initialize the system
    await mainContract.initializeSystem(
      await gameRegistry.getAddress(),
      await resultVerifier.getAddress(),
      await playerSBT.getAddress(),
      await nftManager.getAddress(),
      await tokenEconomy.getAddress(),
      await faucetManager.getAddress(),
      await lotteryPool.getAddress()
    );

    // Set up roles
    const GAME_SERVER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GAME_SERVER"));
    await mainContract.grantRole(GAME_SERVER_ROLE, gameServer.address);
  });

  describe("System Initialization", function () {
    it("Should initialize system correctly", async function () {
      const isOperational = await mainContract.isSystemOperational();
      expect(isOperational).to.be.true;

      const systemStats = await mainContract.getSystemStats();
      expect(systemStats.initialized).to.be.true;
    });

    it("Should prevent double initialization", async function () {
      await expect(
        mainContract.initializeSystem(
          await gameRegistry.getAddress(),
          await resultVerifier.getAddress(),
          await playerSBT.getAddress(),
          await nftManager.getAddress(),
          await tokenEconomy.getAddress(),
          await faucetManager.getAddress(),
          await lotteryPool.getAddress()
        )
      ).to.be.revertedWith("HederaGameLaunchpad: already initialized");
    });
  });

  describe("Game Module Registration", function () {
    it("Should register game module through main contract", async function () {
      const gameId = "test-game";
      const serverAddress = gameServer.address;
      const publicKey = ethers.keccak256(ethers.toUtf8Bytes("test-public-key"));
      const metadataURI = "ipfs://QmTestMetadata";

      await expect(
        mainContract.registerGameModule(
          serverAddress,
          publicKey,
          gameId,
          metadataURI
        )
      ).to.not.be.reverted;

      const game = await gameRegistry.getGameModule(gameId);
      expect(game.gameId).to.equal(gameId);
      expect(game.isActive).to.be.true;
    });
  });

  describe("Player SBT Management", function () {
    it("Should mint SBT to player", async function () {
      const tokenURI = "ipfs://QmPlayerSBTMetadata";

      await expect(
        mainContract.connect(gameServer).mintPlayerSBT(player.address, tokenURI)
      ).to.emit(mainContract, "PlayerRegistered");

      const hasSBT = await playerSBT.hasSBT(player.address);
      expect(hasSBT).to.be.true;
    });

    it("Should prevent duplicate SBT minting", async function () {
      const tokenURI = "ipfs://QmPlayerSBTMetadata";

      await mainContract.connect(gameServer).mintPlayerSBT(player.address, tokenURI);

      await expect(
        mainContract.connect(gameServer).mintPlayerSBT(player.address, tokenURI)
      ).to.be.revertedWith("PlayerSBT: player already has SBT");
    });
  });

  describe("Game Result Submission", function () {
    const gameId = "test-game";
    const metadataURI = "ipfs://QmTestMetadata";
    const publicKey = ethers.keccak256(ethers.toUtf8Bytes("test-public-key"));

    beforeEach(async function () {
      // Register game module
      await mainContract.registerGameModule(
        gameServer.address,
        publicKey,
        gameId,
        metadataURI
      );

      // Mint SBT to player
      await mainContract.connect(gameServer).mintPlayerSBT(
        player.address,
        "ipfs://QmPlayerSBTMetadata"
      );
    });

    it("Should submit and verify game result", async function () {
      const score = 2500;
      const nonce = 1;
      const timestamp = Math.floor(Date.now() / 1000);

      // Create signature
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["address", "string", "uint256", "uint256", "uint256"],
          [player.address, gameId, score, timestamp, nonce]
        )
      );

      const signature = await gameServer.signMessage(ethers.getBytes(messageHash));

      await expect(
        mainContract.connect(gameServer).submitGameResult(
          player.address,
          gameId,
          score,
          signature,
          nonce,
          timestamp
        )
      ).to.emit(mainContract, "GamePlayed");

      const stats = await playerSBT.getPlayerStats(player.address);
      expect(stats.totalGamesPlayed).to.equal(1);
      expect(stats.totalPoints).to.equal(score);
    });
  });

  describe("NFT Achievement System", function () {
    beforeEach(async function () {
      // Mint SBT to player
      await mainContract.connect(gameServer).mintPlayerSBT(
        player.address,
        "ipfs://QmPlayerSBTMetadata"
      );
    });

    it("Should mint achievement NFT", async function () {
      const achievementType = "rare";
      const metadataURI = "ipfs://QmAchievementNFTMetadata";

      await expect(
        mainContract.connect(gameServer).mintAchievementNFT(
          player.address,
          achievementType,
          metadataURI
        )
      ).to.not.be.reverted;

      const nftCount = await nftManager.getPlayerNFTCount(player.address);
      expect(nftCount).to.equal(1);
    });
  });

  describe("Faucet System", function () {
    beforeEach(async function () {
      // Deposit HPLAY to faucet
      const GAME_SERVER_ROLE = await tokenEconomy.GAME_SERVER_ROLE();
      await tokenEconomy.grantRole(GAME_SERVER_ROLE, owner.address);
      await tokenEconomy.mintRewards(await faucetManager.getAddress(), ethers.parseEther("1000000"));
    });

    it("Should swap HBAR for HPLAY", async function () {
      const swapAmount = ethers.parseEther("0.1"); // 0.1 HBAR

      await expect(
        mainContract.connect(player).swapHBARforHPLAY({ value: swapAmount })
      ).to.not.be.reverted;

      const balance = await tokenEconomy.balanceOf(player.address);
      expect(balance).to.be.gt(0);
    });
  });

  describe("Lottery System", function () {
    it("Should execute lottery draw", async function () {
      // This would require setting up participants and fees
      // For now, just test that the function exists and can be called
      await expect(
        mainContract.executeLotteryDraw()
      ).to.not.be.reverted;
    });
  });

  describe("System Statistics", function () {
    it("Should return correct system stats", async function () {
      const stats = await mainContract.getSystemStats();
      
      expect(stats.gamesPlayed).to.equal(0);
      expect(stats.players).to.equal(0);
      expect(stats.rewardsDistributed).to.equal(0);
      expect(stats.initialized).to.be.true;
    });
  });

  describe("Player Information", function () {
    beforeEach(async function () {
      // Mint SBT to player
      await mainContract.connect(gameServer).mintPlayerSBT(
        player.address,
        "ipfs://QmPlayerSBTMetadata"
      );
    });

    it("Should return player information", async function () {
      const playerInfo = await mainContract.getPlayerInfo(player.address);
      
      expect(playerInfo.hasSBT).to.be.true;
      expect(playerInfo.stats.totalGamesPlayed).to.equal(0);
      expect(playerInfo.nftCount).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should pause and unpause system", async function () {
      await mainContract.pauseSystem();
      expect(await mainContract.paused()).to.be.true;

      await mainContract.unpauseSystem();
      expect(await mainContract.paused()).to.be.false;
    });

    it("Should only allow owner to pause system", async function () {
      await expect(
        mainContract.connect(otherAccount).pauseSystem()
      ).to.be.revertedWith("HederaGameLaunchpad: caller is not owner");
    });
  });

  describe("Contract Dependencies", function () {
    it("Should return all contract addresses", async function () {
      const addresses = await mainContract.getContractAddresses();
      
      expect(addresses[0]).to.equal(await gameRegistry.getAddress());
      expect(addresses[1]).to.equal(await resultVerifier.getAddress());
      expect(addresses[2]).to.equal(await playerSBT.getAddress());
      expect(addresses[3]).to.equal(await nftManager.getAddress());
      expect(addresses[4]).to.equal(await tokenEconomy.getAddress());
      expect(addresses[5]).to.equal(await faucetManager.getAddress());
      expect(addresses[6]).to.equal(await lotteryPool.getAddress());
    });
  });
});

