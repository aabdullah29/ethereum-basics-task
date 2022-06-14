async function main() {
    const NFT721Token = await ethers.getContractFactory("NFT721Token");

    // Start deployment, returning a promise that resolves to a contract object
    const nFT721Token = await NFT721Token.deploy();
    console.log("Contract deployed to address:", nFT721Token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
  //0x271D2BeB5db7266Cd34D512C8F8c06AD247fab4a