Here I've created a multisignature wallet on Ethereum using Solidity.

Although this is a trivial task, I want to complete it fully as if it 
were a bigger project, this will include unit testing, documentation,
security automated checks, a security audit, a functional front end, 
and deployed to the Ethereum mainnet. I'll most likely just host it on
a free hosting site such as vercel, and update this page with my own
progress.

- [x] Fully functional multisig wallet
- [x] Unit testing
- [x] 100% line and function coverage in the unit testing
- [x] Deployed contract on testnet
- [x] Verified contract on testnet
https://rinkeby.etherscan.io/address/0x3c2c48f07330b9d5d65ab40cce933d8b304ab344#code
- [x] Make contract upgradable
https://rinkeby.etherscan.io/address/0x1318023d522ede65a9b3d55b690e52877731f53b
https://rinkeby.etherscan.io/address/0x69611ad0093a5dc18cc37166889c561cf81fdaf5
- [x] Gas optimisation
- [ ] Front end built to interact with it
- [ ] Automated security checks (slither/echidna)
- [ ] Manual security audit
- [ ] Documentation
- [ ] Deployed contract on main net
- [ ] Verified contract on main net


The only function not tested is the default solidity fallback function

|---------------|----------|----------|----------|----------|----------------|
|File           |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
|---------------|----------|----------|----------|----------|----------------|
| contracts\    |      100 |       70 |       90 |      100 |                |
|  MultiSig.sol |      100 |       70 |       90 |      100 |                |
|---------------|----------|----------|----------|----------|----------------|
|All files      |      100 |       70 |       90 |      100 |                |
|---------------|----------|----------|----------|----------|----------------|
