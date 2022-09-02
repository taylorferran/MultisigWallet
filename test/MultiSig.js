const { expect } = require("chai");



describe("Multisig wallet contract ", function () {
  it("Create wallet and check it exists", async function () {

    const [addr1, addr2] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);

    expect(await hardhatToken.connect(addr1).checkWalletExists("TestWallet")).to.equal(true);

  });

  it("Create wallet, create transaction with a wallet address which is in the multisig and check it exists", async function () {

    const [addr1, addr2, addr3] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);

    //expect(await hardhatToken.connect(addr1).viewTransaction("TestWallet", 0)).to.equal(false);

    await hardhatToken.connect(addr1).createTransaction("TestWallet", addr3.address, 10);
    
    expect(await hardhatToken.connect(addr1).viewTransaction("TestWallet", 0)).to.equal(true);


  });

  it("Create wallet, create transaction with a wallet address which is NOT in the multisig and check it fails", async function () {

    const [addr1, addr2, addr3] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);
    
    await expect (
        hardhatToken.connect(addr3).createTransaction("TestWallet", addr3.address, 10)
    ).to.be.revertedWith("Wallet not a member of this multi sig.");

  });


  it("Deposit and check multisig wallet amount ", async function () {

    const [addr1, addr2] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);

    expect(await hardhatToken.connect(addr1).checkWalletExists("TestWallet")).to.equal(true);

    await hardhatToken.connect(addr1).depositToWallet("TestWallet", 100000000000, { value: ethers.utils.parseEther("0.0000001") });

    expect(await hardhatToken.connect(addr1).checkWalletAmount("TestWallet")).to.equal(100000000000);

  });

  it("Create wallet with two cosigners, create transaction, have the cosigners validate the transaction, check the amount gets to the deposit address", async function () {

    const [addr1, addr2, addr3] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);

    expect(await hardhatToken.connect(addr1).checkWalletExists("TestWallet")).to.equal(true);

    await hardhatToken.connect(addr1).depositToWallet("TestWallet", 100000000000, { value: ethers.utils.parseEther("0.0000001") });

    expect(await hardhatToken.connect(addr1).checkWalletAmount("TestWallet")).to.equal(100000000000);

    await hardhatToken.connect(addr1).createTransaction("TestWallet", addr3.address, 10);
    
    expect(await hardhatToken.connect(addr1).viewTransaction("TestWallet", 0)).to.equal(true);


    // TODO work out balance and sign off on a transaction
    const provider = ethers.getDefaultProvider();
    const balance = await provider.getBalance(addr1.address);

    expect(balance).to.equal(0);


  });

  it("Create wallet with two cosigners, create transaction, have ONE cosigners validate the transaction, have a dummy address try and validate it, check the amount stays in the multisig wallet", async function () {


  });
});