require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require('solidity-coverage');

  const ALCHEMY_URL = process.env.ALCHEMY_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const API_KEY = process.env.API_KEY;

module.exports = {
  solidity: {
  version: "0.8.16",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
},

  networks: {
    goerli: {
      url: ALCHEMY_URL,
      accounts: [PRIVATE_KEY],
    },
  },

  etherscan: {
    apiKey: {
      goerli: API_KEY
    },
  },


};