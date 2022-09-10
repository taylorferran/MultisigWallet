const { ethers, upgrades } = require("hardhat");

async function main() {

  const MultiSigContract = await ethers.getContractFactory("MultiSig");

  const deployedContract = await upgrades.deployProxy(MultiSigContract, {
    initializer: "initialize",
  });

  await deployedContract.deployed();

  console.log(
    "Multisig contract address: ",
    deployedContract.address
  );


}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
