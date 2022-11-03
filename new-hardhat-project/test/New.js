const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("New", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    const New = await hre.ethers.getContractFactory("New");
    const obj = await New.deploy();
    await obj.deployed();

    const [owner, otherAccount] = await ethers.getSigners();
    // console.log(
    //   `deployed address: ${obj.address}`, "\n",
    //   `owner address: ${owner.address}`, "\n",
    //   `other address: ${otherAccount.address}`
    // );
    return {obj, owner, otherAccount};
  }


  describe("Deployment", function () {

    it("Check Initial count", async function () {
      const {obj} = await loadFixture(deploy);
      expect(await obj.count()).to.equal(0);
    });

  });


    describe("Increment count", function () {
      it("Should emit Count event on count", async function () {
        const { obj } = await loadFixture(deploy);

        await expect(obj.inc(10))
          .to.emit(obj, "Count")
          .withArgs(10); // We accept 10
      });

      it("Should emit CountInd event on count", async function () {
        const { obj } = await loadFixture(deploy);

        await expect(obj.inc(10))
          .to.emit(obj, "CountInd")
          .withArgs(10); // We accept 10        
      });
    });
});
