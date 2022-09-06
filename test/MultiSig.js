const { expect } = require("chai");
const { ethers } = require("hardhat");

const provider = ethers.provider;


describe("Multisig wallet contract ", function () {
  it("Create wallet and check it exists", async function () {

    const [addr1, addr2] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    // Create wallet
    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);

    // Check it exists
    expect(await hardhatToken.connect(addr1).checkWalletExists("TestWallet")).to.equal(true);

  });

  it("Create wallet, create transaction with a wallet address which is in the multisig and check it exists", async function () {

    const [addr1, addr2, addr3] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    // Create wallet
    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);

    // Create transaction
    await hardhatToken.connect(addr1).createTransaction("TestWallet", addr3.address, 10);
    
    // Check it exists
    expect(await hardhatToken.connect(addr1).viewTransaction("TestWallet", 0)).to.equal(true);


  });

  it("Create wallet, create transaction with a wallet address which is NOT in the multisig and check it fails", async function () {

    const [addr1, addr2, addr3] = await ethers.getSigners();

    const MultiSig = await ethers.getContractFactory("MultiSig");

    const hardhatToken = await MultiSig.deploy();

    const addressArray = [addr1.address, addr2.address];

    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);
  
    // Create transaction with address not in the multisig wallet and expect it to fail
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

    // Deposit ether
    await hardhatToken.connect(addr1).depositToWallet("TestWallet", 100000000000, { value: ethers.utils.parseEther("0.0000001") });

    // Validate it's saved to the correct wallet id
    expect(await hardhatToken.connect(addr1).checkWalletAmount("TestWallet")).to.equal(100000000000);

  });

  it("Create wallet with two cosigners, create transaction, have the cosigners validate the transaction, check the amount gets to the deposit address", async function () {

    const [addr1, addr2, addr3] = await ethers.getSigners();

    const addr3Balance = ethers.BigNumber.from(await provider.getBalance(addr3.address));

    const MultiSig = await ethers.getContractFactory("MultiSig");
    
    const hardhatToken = await MultiSig.deploy();
    
    const addressArray = [addr1.address, addr2.address];
    
    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);
    
    expect(await hardhatToken.connect(addr1).checkWalletExists("TestWallet")).to.equal(true);
    
    const oneETH = ethers.BigNumber.from("1000000000000000000");  
    
    await hardhatToken.connect(addr1).depositToWallet("TestWallet", oneETH, { value: ethers.utils.parseEther("1") });
    
    expect(await hardhatToken.connect(addr1).checkWalletAmount("TestWallet")).to.equal(oneETH);
    
    expect(await provider.getBalance(addr3.address)).to.equal(addr3Balance);

    // Create txn to send one ether to address3
    await hardhatToken.connect(addr1).createTransaction("TestWallet", addr3.address, oneETH);
    expect(await hardhatToken.connect(addr1).viewTransaction("TestWallet", 0)).to.equal(true);

    await hardhatToken.connect(addr1).depositToWallet("TestWallet", oneETH, { value: ethers.utils.parseEther("1") });

    expect(await provider.getBalance(addr3.address)).to.equal(addr3Balance);

    // Sign off on transaction with addr1 and addr2
    await hardhatToken.connect(addr1).validateTransaction("TestWallet", 0);
    // Signatures will hit 0 here and ether will get sent out by contract
    await hardhatToken.connect(addr2).validateTransaction("TestWallet", 0);
    
    expect(await provider.getBalance(addr3.address)).to.equal(addr3Balance.add(oneETH));


  });

  it("Create wallet with two cosigners, create transaction, have ONE cosigners validate the transaction, have a dummy address try and validate it, check the amount stays in the multisig wallet", async function () {

    const [addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const addr3Balance = ethers.BigNumber.from(await provider.getBalance(addr3.address));

    const MultiSig = await ethers.getContractFactory("MultiSig");
    
    const hardhatToken = await MultiSig.deploy();
    
    const addressArray = [addr1.address, addr2.address];
    
    await hardhatToken.connect(addr1).createMultiSigWallet("TestWallet", addressArray);
    
    expect(await hardhatToken.connect(addr1).checkWalletExists("TestWallet")).to.equal(true);
    
    const oneETH = ethers.BigNumber.from("1000000000000000000");  
    
    await hardhatToken.connect(addr1).depositToWallet("TestWallet", oneETH, { value: ethers.utils.parseEther("1") });
    
    expect(await hardhatToken.connect(addr1).checkWalletAmount("TestWallet")).to.equal(oneETH);
    
    expect(await provider.getBalance(addr3.address)).to.equal(addr3Balance);
    
    // Create txn to send one ether to address3
    await hardhatToken.connect(addr1).createTransaction("TestWallet", addr3.address, oneETH);
    expect(await hardhatToken.connect(addr1).viewTransaction("TestWallet", 0)).to.equal(true);

    await hardhatToken.connect(addr1).depositToWallet("TestWallet", oneETH, { value: ethers.utils.parseEther("1") });

    expect(await provider.getBalance(addr3.address)).to.equal(addr3Balance);

    // Sign off on transaction with addr1 and addr4
    await hardhatToken.connect(addr1).validateTransaction("TestWallet", 0);

    // Addr4 is not apart of the multisig so this will fail
    await expect (
      hardhatToken.connect(addr4).validateTransaction("TestWallet", 0)
    ).to.be.revertedWith("Wallet not a member of this multi sig.");
    
    const afterTransaction = ethers.BigNumber.from(addr3Balance);

    // ether not sent to address, still pending sign off from addr2
    expect(await provider.getBalance(addr3.address)).to.equal(afterTransaction);


  });
});