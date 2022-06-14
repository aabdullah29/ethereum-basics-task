const FoxToken = artifacts.require("./FoxToken.sol");
const SaleFoxToken = artifacts.require("./SaleFoxToken.sol");

module.exports = function (deployer) {
  // deployer.deploy(FoxToken, 1000000);
  // deployer.deploy(SaleFoxToken);
  deployer.deploy(FoxToken, 1000000).then(()=>{
    // in wei (0.001 Ether)
    const tokenPrice = 1000000000000000; 
    return deployer.deploy(SaleFoxToken, FoxToken.address, tokenPrice)
  })
};
