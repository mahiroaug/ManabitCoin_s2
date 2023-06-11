import './App.css';
import { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

const Chains = {
  1: "Mainnet",
  3: "Ropsten",
  5: "Goerli",
}

const getAccount = async () => {
  try {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (account.length > 0) {
      return account[0];
    } else {
      return "";
    }
  } catch (err) {
    if (err.code === 4001) {
      // EIP-1193 userRejectedRequest error
      // If this happens, the user rejected the connection request.
      console.log('Please connect to MetaMask.');
    } else {
      console.error(err);
    }
    return "";
  }
}

const getChainID = async () => {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainId);
}


const handleAccountChanged = async (accountNo, setAccount, setChainId) => {
  const account = await getAccount();
  setAccount(account);

  const chainId = await getChainID();
  setChainId(chainId);
}

function App() {
  const [address, setAddress] = useState("");
  const [account, setAccount] = useState("-");
  const [chainId, setChainId] = useState(0);
  const btnDisabled = account !== "-";

  let web3;

  const enable = async () => {
    const provider = await detectEthereumProvider({ mustBeMetaMask: true });
    if (provider && window.ethereum?.isMetaMask) {
      console.log('Welcome to MetaMask User🎉');
      
      web3 = await new Web3(Web3.givenProvider);
      web3.eth.defaultChain = "goerli";
      
      const accounts = await web3.eth.requestAccounts();
      setAddress(accounts[0]);


    } else {
      console.log('Please Install MetaMask🙇‍♂️')
    }
  }



  const initializeAccount = async () => {
    const account = getAccount();
    if (account !== "") {
      handleAccountChanged(account, setAccount, setChainId);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on("accountsChanged", (accountNo) => handleAccountChanged(accountNo, setAccount, setChainId));
      window.ethereum.on("chainChanged", (accountNo) => handleAccountChanged(accountNo, setAccount, setChainId));
    }
  }, [account]);

  enable();

  return (
    <div>
      <h2>MetaMask test</h2>
      
      <div>
        <h3>web3.givenProvider check</h3>
        <p id="account">Address: {address}</p>
      </div>


      <div>
        <h3>handleAccountChanged</h3>
        <button id="GetAccountButton" onClick={initializeAccount} disabled={btnDisabled}>Get Account</button>
        <p id="account">[eth_requestAccounts] : Address: {account}</p>
        <p id="account">[eth_chainId] : Chain ID: {chainId}</p>
        <p id="account">Chain Name: {Chains[chainId]}</p>
      </div>


    </div >
  );
}

export default App;