// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

/// @title A multisig wallet creator, saving wallets by keys as a string in mappings
/// @author Taylor Ferran

contract MultiSig {

    // VARIABLES ///

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

    /// MODIFIERS ///

    /// @notice Checks if a wallet with this specific name has been created yet
    /// @dev If a wallet has been added to the mapping already then it will return false
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    modifier walletNameCheck (string memory _walletName) {
        require(walletMapping[_walletName].created, "Wallet doesn't exist");
        _;
    }

    /// @notice Check if an address trying to interact with a multisig wallet is a member of that multisig wallet 
    /// @dev Use this to verify or creare transactions for a specific wallet
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
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

    /// UPGRADE FUNCTIONALITY ///

    /// @dev
    //   Here I'm manually adding the openzepplin reentrancy guard 
    //   so that we can make this contract upgradeable

    //   TODO: Revisit, clean up or decide if we even need reentrancy guards
    //   in this contract, it's only used once, maybe we can implement a more
    //   simple one

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

       modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
    
    
    function initialize() external {
        _status = _NOT_ENTERED;
    }

    /// WRITES ///

    /// @notice Creates a multisig wallet that is identified by string name and list of addresses
    /// @dev Add wallet details to wallet mapping, TODO: better address verifitcation 
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    /// @param _addressList is a list of addresses which can verify or create transactions for the wallet
    function createMultiSigWallet(string memory _walletName, address[] memory _addressList) 
    external {
        require(bytes(_walletName).length < 20, "Wallet must be less than 20 chars");
        require(_addressList.length <= 10 && _addressList.length > 1, "2-10 address count allowed");
        require(!walletMapping[_walletName].created, "Wallet with this name exists");
        walletMapping[_walletName].created = true;
        walletMapping[_walletName].addresses = _addressList;
    }

    /// @notice Deposits eth to a wallet using wallet name
    /// @dev Save ETH in the contract itself and saved amount stored in the walletMapping mapping
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    /// @param _amount is the amount in ETH the user has deposited
    function depositToWallet(string memory _walletName, uint _amount) 
    external payable walletNameCheck(_walletName) {
        require(msg.value == _amount, "Amount sent incorrect");
        walletMapping[_walletName].amountStored += _amount;
    }

    /// @notice create a transaction which needs verified by all members of the multsig
    /// @dev Add transaction to transaction mapping, set all addresses in that multisig to be ready to sign it
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    /// @param _depositAddress is the address in which the ETH will be sent when all members of multisig have signed off on the transaction
    /// @param _amount is the amount in ETH the transaction will send from the multisig 
    function createTransaction(string memory _walletName, address _depositAddress, uint _amount) 
    external walletNameCheck(_walletName) isAddressMemberOfMultisig(_walletName) {

        // Check how many signatures are needed to sign off on the transaction
        uint _num_of_wallets = walletMapping[_walletName].addresses.length;

        // Create transaction struct to place into map
        transactions memory createdTransaction = transactions(
            {
                depositAddress : _depositAddress,
                amountToSend : _amount,
                signatures : _num_of_wallets
            }
        );

        // Add transaction to it's correct wallet
        walletMapping[_walletName].transactions.push(createdTransaction);
        uint transactionID = walletMapping[_walletName].transactions.length-1;

        // Set signatures ready to be signed by each address 
        for(uint i=0; i<_num_of_wallets; ++i) {
            transactionPerWallet[walletMapping[_walletName].addresses[i]][_walletName][transactionID] = true;
        }
    }

    /// @notice sign off on a transaction if the caller is a member of this wallet and the transaction exists, transaction sends ETH if this is the last wallet to sign
    /// @dev Update wallet mappings, check if all wallets have signed the transaction, send eth if no more wallets to sign
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    /// @param _transactionID is the string of the transaction to sign
    function validateTransaction(string memory _walletName, uint _transactionID) 
    external walletNameCheck(_walletName) isAddressMemberOfMultisig(_walletName) nonReentrant {

        // Check if there is a transaction to be signed at this address
        require(transactionPerWallet[msg.sender][_walletName][_transactionID], "Txn doesn't exist");
        require(walletMapping[_walletName].transactions[_transactionID].signatures > 0, "Transaction already finished");
        // Set it to false to set it as "signed off"
        transactionPerWallet[msg.sender][_walletName][_transactionID] = false;
        // Minus one signature, when it hits 0 we send the transaction as all parties have confirmed the transaction
        walletMapping[_walletName].transactions[_transactionID].signatures -=1;

        // Check if all wallets have signed off on the transaction
        if(walletMapping[_walletName].transactions[_transactionID].signatures == 0) {
            require(walletMapping[_walletName].amountStored >= walletMapping[_walletName].transactions[_transactionID].amountToSend, "Not enough ETH in wallet");
            walletMapping[_walletName].amountStored -= walletMapping[_walletName].transactions[_transactionID].amountToSend;
            // Send eth to deposit address
            (bool sent, ) = walletMapping[_walletName].transactions[_transactionID].depositAddress.call{value: walletMapping[_walletName].transactions[_transactionID].amountToSend}("");
            require(sent, "Transaction failed.");
        }

    } 

    /// READS ///

    /// @notice Return true or false if a transaction for a specific wallet exists or not
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    /// @param _transactionID is the string of the transaction to sign
    function viewTransaction(string memory _walletName, uint _transactionID) 
    external view walletNameCheck(_walletName) returns(bool) {
        // TODO handle false case correctly
        bool exists = walletMapping[_walletName].transactions[_transactionID].signatures > 0 ? true : false;
        return(exists);
    }

    /// @notice Return true or false if a wallet exists or not 
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    function checkWalletExists(string memory _walletName) 
    external view walletNameCheck(_walletName) returns (bool) {
        return (walletMapping[_walletName].created);
    }

    /// @notice Return the amount of ETH stored in this multisig wallet
    /// @param _walletName is a string of a wallet name the user wants to create/view/add a transaction
    function checkWalletAmount(string memory _walletName)
    external view walletNameCheck(_walletName) returns(uint) {
        return walletMapping[_walletName].amountStored;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}


}