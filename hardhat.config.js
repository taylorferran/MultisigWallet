require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-etherscan");

  const ALCHEMY_URL = process.env.ALCHEMY_URL;
  const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
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
    rinkeby: {
      url: ALCHEMY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },

  etherscan: {
    apiKey: {
      rinkeby: API_KEY
    },
  },

  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false
  }



};