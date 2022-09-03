export const MULTISIG_ADDRESS = "0xca8A5BAD7d35F8CFc2212EcB5eb3525E12cC8b4f"

export const abi = [
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_walletName",
          "type": "string"
        }
      ],
      "name": "checkWalletAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_walletName",
          "type": "string"
        }
      ],
      "name": "checkWalletExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_walletName",
          "type": "string"
        },
        {
          "internalType": "address[]",
          "name": "_addressList",
          "type": "address[]"
        }
      ],
      "name": "createMultiSigWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_walletName",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_depositAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "createTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_walletName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "depositToWallet",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_walletName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_transactionID",
          "type": "uint256"
        }
      ],
      "name": "validateTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_walletName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_transactionID",
          "type": "uint256"
        }
      ],
      "name": "viewTransaction",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ]