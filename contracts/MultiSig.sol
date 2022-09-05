// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MultiSig is ReentrancyGuard {

    // Mapping to store each multi sig wallet with a specific name
    mapping(string => wallets) walletMapping;
    // Mapping to keep track of each each signature for each transaction
    mapping(address => mapping(string => mapping(uint => bool))) transactionPerWallet;

    struct wallets {
        address[] addresses;
        uint amountStored;
        transactions[] transactions;
        bool created;
    }

    struct transactions {
        address depositAddress;
        uint amountToSend;
        uint signatures;
    }

    modifier walletExists(string memory _walletName) {
        require(walletMapping[_walletName].created, "Wallet doesn't exist");
        _;
    }

    modifier walletNameLengthCheck(string memory _walletName) {
        require(bytes(_walletName).length < 20, "Wallet must be less than 20 chars");
        _;
    }

    modifier isAddressMemberOfMultisig(string memory _walletName) {
        uint addressCount = walletMapping[_walletName].addresses.length;
        address[] memory addresses = walletMapping[_walletName].addresses;
        bool auth;
        for(uint i=0; i<addressCount; ++i) {
            if(msg.sender == addresses[i]) {
                auth = true;
            }
        }
        require(auth, "Wallet not a member of this multi sig.");
        _;
    }

    function createMultiSigWallet(string memory _walletName, address[] memory _addressList) 
    external {
        require(_addressList.length < 10 && _addressList.length > 1, "2-10 address count allowed");
        require(!walletMapping[_walletName].created, "Wallet with this name exists");
        walletMapping[_walletName].created = true;
        walletMapping[_walletName].addresses = _addressList;
    }

    function depositToWallet(string memory _walletName, uint amount) 
    external payable walletExists(_walletName) {
        require(msg.value == amount, "Amount sent incorrect");
        walletMapping[_walletName].amountStored += amount;
    }

    function createTransaction(string memory _walletName, address _depositAddress, uint _amount) 
    external walletExists(_walletName) isAddressMemberOfMultisig(_walletName) {

        uint _num_of_wallets = walletMapping[_walletName].addresses.length;

        transactions memory createdTransaction = transactions(
            {
                depositAddress : _depositAddress,
                amountToSend : _amount,
                signatures : _num_of_wallets
            }
        );

        walletMapping[_walletName].transactions.push(createdTransaction);
        uint transactionID = walletMapping[_walletName].transactions.length-1;

        // Set signatures ready to be signed by each address 
        for(uint i=0; i<_num_of_wallets; ++i) {
            transactionPerWallet[walletMapping[_walletName].addresses[i]][_walletName][transactionID] = true;
        }
    }


    function validateTransaction(string memory _walletName, uint _transactionID) 
    external walletExists(_walletName) isAddressMemberOfMultisig(_walletName) nonReentrant {

        // Check if there is a transaction to be signed at this address
        require(transactionPerWallet[msg.sender][_walletName][_transactionID], "Txn doesn't exist");
        require(walletMapping[_walletName].transactions[_transactionID].signatures > 0, "Transaction already finished");
        // Set it to false to set it as "signed off"
        transactionPerWallet[msg.sender][_walletName][_transactionID] = false;
        // Minus one signature, when it hits 0 we send the transaction as all parties have confirmed the transaction
        walletMapping[_walletName].transactions[_transactionID].signatures -=1;

        // Check if all wallets have signed off on the transaction
        if(walletMapping[_walletName].transactions[_transactionID].signatures == 0) {
            // Send eth to deposit address
            (bool sent, ) = walletMapping[_walletName].transactions[_transactionID].depositAddress.call{value: walletMapping[_walletName].transactions[_transactionID].amountToSend}("");
            require(sent, "Transaction failed.");
        }

    } 

    function viewTransaction(string memory _walletName, uint _transactionID) 
    external view walletExists(_walletName) returns(bool) {
        // TODO handle false case correctly
        bool exists = walletMapping[_walletName].transactions[_transactionID].signatures > 0 ? true : false;
        return(exists);
    }

    function checkWalletExists(string memory _walletName) 
    external view returns (bool) {
        return (walletMapping[_walletName].created);
    }

    function checkWalletAmount(string memory _walletName)
    external view returns(uint) {
        return walletMapping[_walletName].amountStored;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}


}