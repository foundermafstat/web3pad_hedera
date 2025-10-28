import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { GameRegistry } from "../typechain-types";

describe("GameRegistry", function () {
  let gameRegistry: GameRegistry;
  let owner: HardhatEthersSigner;
  let server: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, server, otherAccount] = await ethers.getSigners();

    const GameRegistry = await ethers.getContractFactory("GameRegistry");
    gameRegistry = await GameRegistry.deploy();
    await gameRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const OWNER_ROLE = await gameRegistry.OWNER_ROLE();
      expect(await gameRegistry.hasRole(OWNER_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with zero games", async function () {
      expect(await gameRegistry.totalGamesRegistered()).to.equal(0);
    });
  });

  describe("Game Registration", function () {
    const gameId = "test-game";
    const metadataURI = "ipfs://QmTestMetadata";
    const publicKey = ethers.keccak256(ethers.toUtf8Bytes("test-public-key"));

    it("Should register a new game module", async function () {
      await expect(
        gameRegistry.registerGameModule(
          server.address,
          publicKey,
          gameId,
          metadataURI
        )
      )
        .to.emit(gameRegistry, "GameModuleRegistered")
        .withArgs(server.address, gameId, metadataURI);

      const game = await gameRegistry.getGameModule(gameId);
      expect(game.authorizedServer).to.equal(server.address);
      expect(game.gameId).to.equal(gameId);
      expect(game.metadataURI).to.equal(metadataURI);
      expect(game.isActive).to.be.true;
    });

    it("Should prevent duplicate game registration", async function () {
      await gameRegistry.registerGameModule(
        server.address,
        publicKey,
        gameId,
        metadataURI
      );

      await expect(
        gameRegistry.registerGameModule(
          server.address,
          publicKey,
          gameId,
          metadataURI
        )
      ).to.be.revertedWith("GameRegistry: game already registered");
    });

    it("Should only allow owner to register games", async function () {
      await expect(
        gameRegistry.connect(otherAccount).registerGameModule(
          server.address,
          publicKey,
          gameId,
          metadataURI
        )
      ).to.be.revertedWith("GameRegistry: caller is not owner");
    });

    it("Should validate input parameters", async function () {
      await expect(
        gameRegistry.registerGameModule(
          ethers.ZeroAddress,
          publicKey,
          gameId,
          metadataURI
        )
      ).to.be.revertedWith("GameRegistry: invalid server address");

      await expect(
        gameRegistry.registerGameModule(
          server.address,
          publicKey,
          "",
          metadataURI
        )
      ).to.be.revertedWith("GameRegistry: empty game ID");

      await expect(
        gameRegistry.registerGameModule(
          server.address,
          publicKey,
          gameId,
          ""
        )
      ).to.be.revertedWith("GameRegistry: empty metadata URI");
    });
  });

  describe("Game Management", function () {
    const gameId = "test-game";
    const metadataURI = "ipfs://QmTestMetadata";
    const publicKey = ethers.keccak256(ethers.toUtf8Bytes("test-public-key"));

    beforeEach(async function () {
      await gameRegistry.registerGameModule(
        server.address,
        publicKey,
        gameId,
        metadataURI
      );
    });

    it("Should revoke game module", async function () {
      await expect(gameRegistry.revokeGameModule(gameId))
        .to.emit(gameRegistry, "GameModuleRevoked")
        .withArgs(gameId);

      const game = await gameRegistry.getGameModule(gameId);
      expect(game.isActive).to.be.false;
    });

    it("Should update server public key", async function () {
      const newPublicKey = ethers.keccak256(ethers.toUtf8Bytes("new-public-key"));

      await expect(gameRegistry.updateServerPublicKey(gameId, newPublicKey))
        .to.emit(gameRegistry, "ServerPublicKeyUpdated")
        .withArgs(gameId, newPublicKey);

      const game = await gameRegistry.getGameModule(gameId);
      expect(game.serverPublicKey).to.equal(newPublicKey);
    });

    it("Should set difficulty multiplier", async function () {
      const DAO_ROLE = await gameRegistry.DAO_ROLE();
      await gameRegistry.grantRole(DAO_ROLE, owner.address);

      await gameRegistry.setDifficultyMultiplier(gameId, 1500);
      expect(await gameRegistry.getDifficultyMultiplier(gameId)).to.equal(1500);
    });

    it("Should validate server for game", async function () {
      expect(await gameRegistry.isValidServer(gameId, server.address)).to.be.true;
      expect(await gameRegistry.isValidServer(gameId, otherAccount.address)).to.be.false;
    });
  });

  describe("Access Control", function () {
    it("Should pause and unpause contract", async function () {
      await gameRegistry.pause();
      expect(await gameRegistry.paused()).to.be.true;

      await gameRegistry.unpause();
      expect(await gameRegistry.paused()).to.be.false;
    });

    it("Should grant and revoke roles", async function () {
      const DAO_ROLE = await gameRegistry.DAO_ROLE();
      
      await gameRegistry.grantRole(DAO_ROLE, otherAccount.address);
      expect(await gameRegistry.hasRole(DAO_ROLE, otherAccount.address)).to.be.true;

      await gameRegistry.revokeRole(DAO_ROLE, otherAccount.address);
      expect(await gameRegistry.hasRole(DAO_ROLE, otherAccount.address)).to.be.false;
    });
  });
});

