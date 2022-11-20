import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MULTISIG_ADDRESS, abi } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [viewWalletString, setViewWalletString] = useState("");
  const [viewWalletForTxn, setWalletForTxn] = useState("");
  const [viewDepositAddressForTxn, setDepositAddressForTxn] = useState("");
  const [viewDepositAmountForTxn, setDepositAmountForTxn] = useState("");

  const walletName = event => {
    setViewWalletString(event.target.value);
  };

  const walletNameForTxn = event => {
    setWalletForTxn(event.target.value);
  };

  const depositAddressForTxn = event => {
    setDepositAddressForTxn(event.target.value);
  };

  const depositAmountForTxn = event => {
    setDepositAmountForTxn(event.target.value);
  };


  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * createMultiSigWallet creates a multisig wallet with the current parameters
   */
  const createMultiSigWallet = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const multsigContract = new Contract(
        MULTISIG_ADDRESS,
        abi,
        signer
      );
      // call createMultiSigWallet from the contract
      console.log(String(viewWalletString));
      const tx = await multsigContract.createMultiSigWallet(String(viewWalletString), ["0xa8430797A27A652C03C46D5939a8e7698491BEd6","0xa8430797A27A652C03C46D5939a8e7698491BEd6"]);
      // wait for the transaction to get mined
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };


  const createTransactionX = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const multsigContract = new Contract(
        MULTISIG_ADDRESS,
        abi,
        signer
      );

      const tx = await multsigContract.createTransaction(String(viewWalletForTxn), String(viewDepositAddressForTxn), String(viewDepositAmountForTxn));
      // wait for the transaction to get mined
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

    /**
   * createMultiSigWallet creates a multisig wallet with the current parameters
   */
     const viewWallet = async () => {
      try {
        // We need a Signer here since this is a 'write' transaction.
        const signer = await getProviderOrSigner(true);
        // Create a new instance of the Contract with a Signer, which allows
        // update methods
        const multsigContract = new Contract(
          MULTISIG_ADDRESS,
          abi,
          signer
        );
        const tx = await multsigContract.checkWalletExists(String(viewWalletString));

        if(tx) {
          alert("Wallet exists");
        }
        alert
      } catch (err) {
        console.error(err);
      }
    };

    /**
   * createMultiSigWallet creates a multisig wallet with the current parameters
   */
     const viewWalletAmount = async () => {
      try {
        // We need a Signer here since this is a 'write' transaction.
        const signer = await getProviderOrSigner(true);
        // Create a new instance of the Contract with a Signer, which allows
        // update methods
        const multsigContract = new Contract(
          MULTISIG_ADDRESS,
          abi,
          signer
        );
        const tx = await multsigContract.checkWalletAmount(String(viewWalletString));

        alert(tx);

      } catch (err) {
        console.error(err);
      }
    };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);

    } catch (err) {
      console.error(err);
    }
  };

  /*
    createWalletButton
  */
  const createWalletButton = () => {
    if (walletConnected) {
        return (
          <button onClick={createMultiSigWallet} className={styles.button}>
            Create multisig wallet
          </button>
        );
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  /*
    viewWalletButton
  */
    const viewWalletButton = () => {
      if (walletConnected) {
          return (
            <button onClick={viewWallet} className={styles.button}>
              View Wallet
            </button>
          );
      }
    };

  /*
    viewWalletAmountButton
  */
    const viewWalletAmountButton = () => {
      if (walletConnected) {
          return (
            <button onClick={viewWalletAmount} className={styles.button}>
              View Wallet Amount
            </button>
          );
      }
    };


    const createTransactionButton = () => {
      if (walletConnected) {
          return (
            <div>
              <input
                placeholder="Enter wallet name"
                onChange={walletNameForTxn}
              />
              <input
                placeholder="Enter deposit address"
                onChange={depositAddressForTxn}
              />
              <input
                placeholder="Enter deposit amount"
                onChange={depositAmountForTxn}
              />
              <button onClick={createTransactionX} className={styles.button}>
                Create transaction
              </button>
            </div>
          );
      }
    };


  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Multisig Dapp</title>
        <meta name="description" content="Multisig-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>This is a multisig dapp</h1>
          <div className={styles.description}>
            It's a multisig wallet decentralized application on Ethereum.
          </div>

          <input
            placeholder="Wallet Name"
            onChange={walletName}
            className={styles.input}
            />
            {createWalletButton()}
            {viewWalletButton()}
            {viewWalletAmountButton()}
            <p></p>
            {createTransactionButton()}
        </div>  

        
      </div>
    </div>
  );
}