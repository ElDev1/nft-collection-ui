import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { useEffect, useState } from "react";
import { ethers } from 'ethers';
import myNft from "./utils/abiContract/myNft.json"

// Constants
const TWITTER_HANDLE = 'deviAmaolo';
const TWITTER_LINK = `https://twitter.com/deviAmaolo`;
const OPENSEA_LINK = 'https://testnets.opensea.io/es/collection/squarenft-215';
//const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x59c9662B171188CFEBBc2EDF9608b2381428483e";


const App = () => {
  
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinig, setIsMining] = useState(false)

  const checkIfWalletIsConnected = async () => {
    
    const { ethereum } = window;

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    const goerliChainId = "0x5"; 
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
      alert("Change to Goerli network in your ethereum wallet!")
}

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    //Check if we are authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener()
    } else {
      console.log("No authorized account found");
    }
  
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      setupEventListener()
    } catch (error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNft.abi, signer);

        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {  
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNft.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeNFT();
        
        setIsMining(true)
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        setIsMining(false)
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
  
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => {
    return(
      <div>
        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
          Mint NFT
        </button>
        <div style={{marginTop: "15px"}}>
          <a href={OPENSEA_LINK} target="_blank" rel='noreferrer'>Check minted NFTs on Open Sea</a>
        </div>
      </div>
      )
  }
  
  const RenderIsMiningLoading = () => {
    return (
      <div>
        <h3 className='mining'>Mining... plase wait.</h3>
      </div>
    )
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each special. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            renderMintUI()
          )}
          {isMinig ? RenderIsMiningLoading() : ""}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
