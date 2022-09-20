import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MULTISIG_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // Wallet name to view
  const [viewWalletString, setViewWalletString] = useState("test");

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
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
  
  /**
   * createMultiSigWallet: Adds a multisig wallet to contract storage
   */
   const createMultiSigWallet = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const MultiSigContract = new Contract(
        MULTISIG_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToWhitelist from the contract
      const tx = await MultiSigContract.createMultiSigWallet("Test", ["0xa8430797A27A652C03C46D5939a8e7698491BEd6", "0xa8430797A27A652C03C46D5939a8e7698491BEd6"]);
      // wait for the transaction to get mined
      await tx.wait();
      // get the updated number of addresses in the whitelist
      const tx2 = await  MultiSigContract.viewWallet("Test");
    } catch (err) {
      console.error(err);
    }
  };



  /*
    renderButton: Returns a button based on the state of the dapp
  */
    const renderButton = () => {
      if (walletConnected) {
        if (walletConnected) {
          return (
            <button onClick={createMultiSigWallet}>
              Add test wallet to contract
            </button>
          );
        }
      } else {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect ur wallet
          </button>
        );
      }
    };
  
    // useEffects are used to react to changes in state of the website
    // The array at the end of function call represents what state changes will trigger this effect
    // In this case, whenever the value of `walletConnected` changes - this effect will be called
    useEffect(() => {
      // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
      if (!walletConnected) {
        // Assign the Web3Modal class to the reference object by setting it's `current` value
        // The `current` value is persisted throughout as long as this page is open
        web3ModalRef.current = new Web3Modal({
          network: "rinkeby",
          providerOptions: {},
          disableInjectedProvider: false,
        });
        connectWallet();
      }
    }, [walletConnected]);

    return (
      <div>
        <Head>
          <title>Multisig wallet dapp</title>
          <meta name="description" content="Multisig-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to multisig wallet</h1>
            <div className={styles.description}>
              Its a multisignature wallet dapp.
            </div>
            {renderButton()}
          </div>
        </div>
  
        <footer className={styles.footer}>
          Made with &#10084; by Taylor
        </footer>
      </div>
    );
  



}