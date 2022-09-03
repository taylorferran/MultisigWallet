const { ethers } = require("hardhat");

async function main() {

  const MultiSigContract = await ethers.getContractFactory("MultiSig");

  const deployedContract = await MultiSigContract.deploy();

  await deployedContract.deployed();

  console.log(
    "Multisig contract address: ",
    deployedContract.address
  );
/*
  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: deployedContract.address,
  });

*/
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
