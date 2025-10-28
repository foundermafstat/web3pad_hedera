import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";

// Hedera uses different key format, so we need to handle it specially
function getHederaAccounts() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.warn("No PRIVATE_KEY found in environment variables");
    return [];
  }
  
  // Check if it's a Hedera private key (various formats)
  if (privateKey.startsWith('302e0201') || privateKey.startsWith('3030020100')) {
    console.warn("Hedera private key detected. Attempting conversion...");
    try {
      // For Hedera keys, we need to extract the raw private key
      // This is a simplified approach - in production you'd use proper Hedera SDK
      
      // Try different extraction methods based on key length
      let rawKey = '';
      
      if (privateKey.length === 100) {
        // Format: 3030020100... (50 bytes total)
        // Extract the last 64 characters (32 bytes)
        rawKey = privateKey.slice(-64);
      } else if (privateKey.length === 68) {
        // Format: 302e0201... (34 bytes total)
        // Extract the last 64 characters (32 bytes)
        rawKey = privateKey.slice(-64);
      } else {
        // Try to find 64-character hex sequence
        const hexMatch = privateKey.match(/[0-9a-fA-F]{64}/);
        if (hexMatch) {
          rawKey = hexMatch[0];
        }
      }
      
      if (rawKey.length === 64) {
        console.log("✅ Successfully extracted Ethereum-compatible key");
        return [rawKey];
      }
    } catch (error) {
      console.error("Error processing Hedera key:", error);
    }
    console.warn("❌ Could not convert Hedera key to Ethereum format");
    return [];
  }
  
  // Standard Ethereum private key (should be 64 characters)
  if (privateKey.length === 64) {
    return [privateKey];
  }
  
  // If it has 0x prefix, remove it
  if (privateKey.startsWith('0x') && privateKey.length === 66) {
    return [privateKey.slice(2)];
  }
  
  console.warn("Invalid private key format. Expected 64 characters or Hedera DER format");
  return [];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1, // Минимальное количество прогонов для максимальной скорости
      },
      // Максимальные настройки для ускорения компиляции
      viaIR: false,
      evmVersion: "london",
      // Отключаем неиспользуемые функции для ускорения
      debug: {
        revertStrings: "strip"
      },
      // Настройки для быстрой компиляции
      metadata: {
        bytecodeHash: "none"
      }
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      // Максимальные лимиты для больших контрактов
      gas: 30000000,
      gasPrice: 1000000000,
      // Настройки для быстрой работы
      blockGasLimit: 30000000,
      allowUnlimitedContractSize: true,
    },
    hedera_testnet: {
      type: "http",
      url: "https://testnet.hashio.io/api",
      chainId: 296,
      accounts: getHederaAccounts(),
      gas: 30000000,
      gasPrice: 500000000000, // Increased to meet Hedera minimum
    },
    hedera_mainnet: {
      type: "http",
      url: "https://mainnet.hashio.io/api",
      chainId: 295,
      accounts: getHederaAccounts(),
      gas: 30000000,
      gasPrice: 500000000000, // Increased to meet Hedera minimum
    },
  },
  paths: {
    sources: "./core",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Максимальные настройки TypeChain для скорости
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false,
    // Отключаем генерацию типов для ускорения
    discriminateTypes: false,
  },
  // Настройки для максимальной скорости тестов
  mocha: {
    timeout: 60000,
    // Параллельное выполнение тестов
    parallel: true,
    // Быстрый выход при первой ошибке
    bail: true,
  },
  // Настройки кэширования для ускорения
  cache: {
    // Включаем агрессивное кэширование
    enabled: true,
    // Увеличиваем размер кэша
    maxMemoryEntries: 1000,
  },
  // Настройки для быстрой компиляции
  compiler: {
    // Отключаем проверки для ускорения
    strict: false,
    // Быстрая компиляция
    fast: true,
  },
};

export default config;