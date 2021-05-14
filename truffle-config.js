const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
    BSCTestnet: {
      provider: () => new HDWalletProvider('YOUR_PRV_KEY', "https://data-seed-prebsc-1-s1.binance.org:8545"),
      network_id: "97",
      // gas: 10000000
    },
    BSCMainnet: {
      provider: () => new HDWalletProvider('YOUR_PRV_KEY', "https://bsc-dataseed1.defibit.io"),
      network_id: "56",
      // gas: 10000000
    }
  },
  compilers: {
    solc: {
      version: "0.6.12"
    }
  }
};
