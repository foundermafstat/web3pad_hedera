#!/usr/bin/env node

/**
 * Hedera Status Checker
 * Checks if Hedera client is properly configured and can connect to the network
 */

import { initializeHederaClient, getContractConfig } from '../lib/hedera-config.js';
import { contractService } from '../lib/contract-service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkHederaStatus() {
    console.log('🔍 Checking Hedera Status...\n');

    // 1. Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`   HEDERA_ACCOUNT_ID: ${process.env.HEDERA_ACCOUNT_ID ? '✅ Set' : '❌ Not set'}`);
    console.log(`   HEDERA_PRIVATE_KEY: ${process.env.HEDERA_PRIVATE_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`   FAUCET_MANAGER_HEDERA_ID: ${process.env.FAUCET_MANAGER_HEDERA_ID ? '✅ Set' : '❌ Not set'}`);
    console.log('');

    // 2. Check Hedera client initialization
    try {
        const client = initializeHederaClient();
        console.log('🔧 Hedera Client:');
        console.log(`   Initialized: ✅ Yes`);
        console.log(`   Operator Set: ${client.operatorAccountId ? '✅ Yes' : '❌ No'}`);
        if (client.operatorAccountId) {
            console.log(`   Operator Account: ${client.operatorAccountId.toString()}`);
        }
        console.log('');
    } catch (error) {
        console.log('🔧 Hedera Client:');
        console.log(`   Initialized: ❌ Failed`);
        console.log(`   Error: ${error.message}`);
        console.log('');
    }

    // 3. Check contract configuration
    try {
        const faucetConfig = getContractConfig('FaucetManager');
        console.log('📄 Contract Configuration:');
        console.log(`   FaucetManager Address: ✅ ${faucetConfig.address}`);
        console.log('');
    } catch (error) {
        console.log('📄 Contract Configuration:');
        console.log(`   Error: ❌ ${error.message}`);
        console.log('');
    }

    // 4. Test contract calls
    console.log('🧪 Testing Contract Calls:');
    
    try {
        const swapRate = await contractService.getSwapRate();
        console.log(`   getSwapRate(): ✅ Success`);
        console.log(`   Rate: 1 HBAR = ${swapRate.hbarToHplayRate} HPLAY`);
        console.log(`   Faucet Enabled: ${swapRate.faucetEnabled ? '✅ Yes' : '❌ No'}`);
    } catch (error) {
        console.log(`   getSwapRate(): ❌ Failed - ${error.message}`);
    }

    try {
        const testAddress = '0.0.5911528';
        const balance = await contractService.getHbarBalance(testAddress);
        console.log(`   getHbarBalance(${testAddress}): ✅ Success`);
        console.log(`   Balance: ${(balance / 100000000).toFixed(2)} HBAR`);
    } catch (error) {
        console.log(`   getHbarBalance(): ❌ Failed - ${error.message}`);
    }

    try {
        const testAddress = '0.0.5911528';
        const userInfo = await contractService.getUserSwapInfo(testAddress);
        console.log(`   getUserSwapInfo(${testAddress}): ✅ Success`);
        console.log(`   Daily Used: ${(userInfo.dailyUsedHbar / 100000000).toFixed(2)} HBAR`);
        console.log(`   Total Swaps: ${userInfo.totalSwaps}`);
    } catch (error) {
        console.log(`   getUserSwapInfo(): ❌ Failed - ${error.message}`);
    }

    console.log('\n🎯 Summary:');
    console.log('   - If all tests show ✅, Hedera integration is working correctly');
    console.log('   - If tests show ❌, check your .env file and Hedera account setup');
    console.log('   - Mock data fallback is enabled for failed contract calls');
}

// Run the check
checkHederaStatus().catch(console.error);
