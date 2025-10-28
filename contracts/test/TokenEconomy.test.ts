import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { TokenEconomy } from "../typechain-types";

describe("TokenEconomy", function () {
  let tokenEconomy: TokenEconomy;
  let lotteryPool: any;
  let owner: HardhatEthersSigner;
  let player: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, player, otherAccount] = await ethers.getSigners();

    // Deploy mock lottery pool
    const LotteryPool = await ethers.getContractFactory("LotteryPool");
    lotteryPool = await LotteryPool.deploy(ethers.ZeroAddress);
    await lotteryPool.waitForDeployment();

    const TokenEconomy = await ethers.getContractFactory("TokenEconomy");
    tokenEconomy = await TokenEconomy.deploy(await lotteryPool.getAddress());
    await tokenEconomy.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await tokenEconomy.name()).to.equal("Hedera Play Token");
      expect(await tokenEconomy.symbol()).to.equal("HPLAY");
      expect(await tokenEconomy.decimals()).to.equal(8);
    });

    it("Should set the correct total supply cap", async function () {
      const expectedSupply = ethers.parseEther("10000000000"); // 10B tokens
      expect(await tokenEconomy.maxSupply()).to.equal(expectedSupply);
    });

    it("Should initialize with zero supply", async function () {
      expect(await tokenEconomy.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint rewards to recipient", async function () {
      const GAME_SERVER_ROLE = await tokenEconomy.GAME_SERVER_ROLE();
      await tokenEconomy.grantRole(GAME_SERVER_ROLE, owner.address);

      const amount = ethers.parseEther("1000");
      await expect(tokenEconomy.mintRewards(player.address, amount))
        .to.emit(tokenEconomy, "RewardMinted")
        .withArgs(player.address, amount);

      expect(await tokenEconomy.balanceOf(player.address)).to.equal(amount);
    });

    it("Should prevent minting when disabled", async function () {
      const GAME_SERVER_ROLE = await tokenEconomy.GAME_SERVER_ROLE();
      await tokenEconomy.grantRole(GAME_SERVER_ROLE, owner.address);

      const DAO_ROLE = await tokenEconomy.DAO_ROLE();
      await tokenEconomy.grantRole(DAO_ROLE, owner.address);

      // Disable minting
      const newParams = {
        transferFeePercent: 50,
        burnFeePercent: 10,
        stakingRewardPercent: 100,
        mintingEnabled: false
      };
      await tokenEconomy.updateParams(newParams);

      await expect(
        tokenEconomy.mintRewards(player.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("TokenEconomy: minting disabled");
    });

    it("Should enforce maximum supply", async function () {
      const GAME_SERVER_ROLE = await tokenEconomy.GAME_SERVER_ROLE();
      await tokenEconomy.grantRole(GAME_SERVER_ROLE, owner.address);

      const maxSupply = await tokenEconomy.maxSupply();
      const excessAmount = maxSupply + ethers.parseEther("1");

      await expect(
        tokenEconomy.mintRewards(player.address, excessAmount)
      ).to.be.revertedWith("TokenEconomy: exceeds maximum supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      const GAME_SERVER_ROLE = await tokenEconomy.GAME_SERVER_ROLE();
      await tokenEconomy.grantRole(GAME_SERVER_ROLE, owner.address);
      await tokenEconomy.mintRewards(player.address, ethers.parseEther("1000"));
    });

    it("Should burn tokens correctly", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await tokenEconomy.balanceOf(player.address);

      await expect(tokenEconomy.connect(player).burn(burnAmount))
        .to.emit(tokenEconomy, "TokenBurned")
        .withArgs(player.address, burnAmount);

      expect(await tokenEconomy.balanceOf(player.address)).to.equal(
        initialBalance - burnAmount
      );
    });

    it("Should prevent burning more than balance", async function () {
      const balance = await tokenEconomy.balanceOf(player.address);
      const burnAmount = balance + ethers.parseEther("1");

      await expect(
        tokenEconomy.connect(player).burn(burnAmount)
      ).to.be.revertedWith("TokenEconomy: insufficient balance");
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      const GAME_SERVER_ROLE = await tokenEconomy.GAME_SERVER_ROLE();
      await tokenEconomy.grantRole(GAME_SERVER_ROLE, owner.address);
      await tokenEconomy.mintRewards(player.address, ethers.parseEther("1000"));
    });

    it("Should stake tokens correctly", async function () {
      const stakeAmount = ethers.parseEther("100");

      await expect(tokenEconomy.connect(player).stake(stakeAmount))
        .to.emit(tokenEconomy, "TokensStaked")
        .withArgs(player.address, stakeAmount);

      expect(await tokenEconomy.getStakedBalance(player.address)).to.equal(stakeAmount);
      expect(await tokenEconomy.balanceOf(player.address)).to.equal(
        ethers.parseEther("900")
      );
    });

    it("Should unstake tokens and calculate rewards", async function () {
      const stakeAmount = ethers.parseEther("100");
      await tokenEconomy.connect(player).stake(stakeAmount);

      // Fast forward time to generate rewards
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine", []);

      await expect(tokenEconomy.connect(player).unstake(stakeAmount))
        .to.emit(tokenEconomy, "TokensUnstaked");

      expect(await tokenEconomy.getStakedBalance(player.address)).to.equal(0);
    });

    it("Should prevent unstaking more than staked", async function () {
      const stakeAmount = ethers.parseEther("100");
      await tokenEconomy.connect(player).stake(stakeAmount);

      await expect(
        tokenEconomy.connect(player).unstake(stakeAmount + ethers.parseEther("1"))
      ).to.be.revertedWith("TokenEconomy: insufficient staked balance");
    });
  });

  describe("Transfer Fees", function () {
    beforeEach(async function () {
      const GAME_SERVER_ROLE = await tokenEconomy.GAME_SERVER_ROLE();
      await tokenEconomy.grantRole(GAME_SERVER_ROLE, owner.address);
      await tokenEconomy.mintRewards(player.address, ethers.parseEther("1000"));
    });

    it("Should apply transfer fees", async function () {
      const transferAmount = ethers.parseEther("100");
      const feePercent = 50; // 0.5%
      const expectedFee = (transferAmount * BigInt(feePercent)) / BigInt(10000);

      await tokenEconomy.connect(player).transfer(otherAccount.address, transferAmount);

      const playerBalance = await tokenEconomy.balanceOf(player.address);
      const otherBalance = await tokenEconomy.balanceOf(otherAccount.address);

      expect(otherBalance).to.equal(transferAmount - expectedFee);
      expect(playerBalance).to.equal(ethers.parseEther("900") - expectedFee);
    });
  });

  describe("Parameter Updates", function () {
    it("Should update token parameters", async function () {
      const DAO_ROLE = await tokenEconomy.DAO_ROLE();
      await tokenEconomy.grantRole(DAO_ROLE, owner.address);

      const newParams = {
        transferFeePercent: 100,    // 1%
        burnFeePercent: 20,        // 0.2%
        stakingRewardPercent: 200,  // 2%
        mintingEnabled: true
      };

      await expect(tokenEconomy.updateParams(newParams))
        .to.emit(tokenEconomy, "ParamsUpdated")
        .withArgs(newParams);
    });

    it("Should only allow DAO to update parameters", async function () {
      const newParams = {
        transferFeePercent: 100,
        burnFeePercent: 20,
        stakingRewardPercent: 200,
        mintingEnabled: true
      };

      await expect(
        tokenEconomy.connect(otherAccount).updateParams(newParams)
      ).to.be.revertedWith("TokenEconomy: caller is not DAO");
    });
  });

  describe("Access Control", function () {
    it("Should pause and unpause contract", async function () {
      await tokenEconomy.pause();
      expect(await tokenEconomy.paused()).to.be.true;

      await tokenEconomy.unpause();
      expect(await tokenEconomy.paused()).to.be.false;
    });

    it("Should grant and revoke roles", async function () {
      const DAO_ROLE = await tokenEconomy.DAO_ROLE();
      
      await tokenEconomy.grantRole(DAO_ROLE, otherAccount.address);
      expect(await tokenEconomy.hasRole(DAO_ROLE, otherAccount.address)).to.be.true;

      await tokenEconomy.revokeRole(DAO_ROLE, otherAccount.address);
      expect(await tokenEconomy.hasRole(DAO_ROLE, otherAccount.address)).to.be.false;
    });
  });
});

