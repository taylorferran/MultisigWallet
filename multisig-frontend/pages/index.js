import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MULTISIG_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // Wallet name to view
  const [viewWalletString, setViewWalletString] = useState("test");

  const walletName = event => {
    setViewWalletString(event.target.value);
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
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
        </div>

        
      </div>
    </div>
  );
}