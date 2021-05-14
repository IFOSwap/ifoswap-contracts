require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

require("@nomiclabs/hardhat-truffle5");

module.exports = {
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
    },
    development: {
      url: "http://127.0.0.1:7545",
      port: 7545,
      network_id: "101"
    },
    test: {
      url: "http://127.0.0.1:7545",
      port: 7545,
      network_id: "*"
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
