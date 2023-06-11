require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});
const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;

const manabitCC = require('./aws-web3-manabit') //CC=Contract Call

async function main() {
    try {

        console.log("---step1--------getOwnerBalance---------------");
        await manabitCC.getOwnerBalance();

        console.log("---step1b-------getAccountBalance-------------");
        await manabitCC.getAccountBalance(process.env.COMMON_ADDRESS);

        console.log("---step1c-------getAllowance(GACHA_CA)--------");
        await manabitCC.getAllowance(GACHA_CA);




        console.log("---step2--------approveGacha(1000)------------");
        await manabitCC.approveGacha(500);

        console.log("---step2b-------getAllowance(GACHA_CA)--------");
        await manabitCC.getAllowance(GACHA_CA);

        //return;

        console.log("---step3--------getOwnerBalance--------------------------");
        await manabitCC.getOwnerBalance();

        console.log("---step3--------getAccountBalance(TEST Wallet)--------------");
        await manabitCC.getAccountBalance(process.env.MY_TEST_ADDRESS);

        console.log("---step3b--------transfer 1 MNBC from OWNER to TEST_Wallet--");
        //await manabitCC.transferMNBC(process.env.MY_TEST_ADDRESS, 1);

        console.log("---step3c--------getOwnerBalance-------------------------");
        await manabitCC.getOwnerBalance();

        console.log("---step3c--------getAccountBalance(TEST Wallet)-------------");
        await manabitCC.getAccountBalance(process.env.MY_TEST_ADDRESS);

        //return;


        console.log("---step4----------sendManabit (to TEST Wallet)---------------");
        //await manabitCC.sendManabit(process.env.MY_TEST_ADDRESS,15,"2023/06/01_17:00|15 Star|mats");

        console.log("---step4b--------getOwnerBalance-------------------------");
        //await manabitCC.getOwnerBalance();

        console.log("---step4c--------getAccountBalance(TEST Wallet)-------------");
        await manabitCC.getAccountBalance(process.env.MY_TEST_ADDRESS);


    } catch (error) {
        console.error('Error:', error);
    }
}

// run script
main();