var SimpleStorage = artifacts.require("./MyLottery.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage, 10, 100);
};
