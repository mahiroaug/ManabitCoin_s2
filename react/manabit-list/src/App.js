import "./App.css";
import React, { useEffect, useState } from 'react';
import Web3 from "web3";
//import Gacha_JSON from "./contracts/ManabitGacha.sol/ManabitGacha.json";
//import Coin_JSON from "./contracts/ManabitCoin.sol/ManabitCoin.json";
//import AWSHttpProvider from "@aws/web3-http-provider";


/*
// AMB 
const endpoint = process.env.REACT_APP_AMB_HTTP_ENDPOINT;
console.log("endpoint: ", endpoint);
const web3 = new Web3(new AWSHttpProvider(endpoint));
*/

/*
// Infura
const endpoint = process.env.REACT_APP_INFURA_PROJECT_ID;
console.log("endpoint: ", endpoint);
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://goerli.infura.io/v3/${endpoint}`
  )
);

// ManabitGacha Contract
const Gacha_abi = Gacha_JSON.abi;
const Gacha_CA = process.env.REACT_APP_GACHA_CA;
const Gacha = new web3.eth.Contract(Gacha_abi, Gacha_CA);

// ManabitCoin Contract
const Coin_abi = Coin_JSON.abi;
const Coin_CA = process.env.REACT_APP_COIN_CA;
const Coin = new web3.eth.Contract(Coin_abi, Coin_CA);

const EoA = process.env.REACT_APP_EOA
console.log("EoA: ", EoA);
*/


async function loadContract() {
  try {
    const response = await fetch("./contracts/ManabitCoin.sol/ManabitCoin.json");
    const data = await response.json();
    console.log("data:", data);
    return data.abi;
  } catch (error) {
    console.error('Error loading contract:', error);
    throw error;
  }
}



const App = () => {
  const [Coin_abi, setContract] = useState(null);

  const [balanceMNBC, setBalanceMNBC] = useState(""); // Define the state for balanceMNBC

  useEffect(() => {

    async function initializeContract() {
      try {
        const loadedContract = await loadContract();
        setContract(loadedContract);
      } catch (error) {
        // Handle error
      }
    }



    const getBalanceMNBC = async () => {
      try {
        const endpoint = process.env.REACT_APP_INFURA_PROJECT_ID;
        console.log("endpoint: ", endpoint);
        const web3 = new Web3(
          new Web3.providers.HttpProvider(
            `https://goerli.infura.io/v3/${endpoint}`
          )
        );
        
        const Coin_CA = process.env.REACT_APP_COIN_CA;
        const Coin = new web3.eth.Contract(Coin_abi, Coin_CA);
        
        const EoA = process.env.REACT_APP_EOA;
        console.log("EoA: ", EoA);
        
        const balanceMNBC = await Coin.methods.balanceOf(EoA).call();
        console.log("balanceMNBC: ", balanceMNBC);
        setBalanceMNBC(balanceMNBC); // Update the balanceMNBC state with the fetched value
      } catch (error) {
        console.error("Error/ getting balance:", error);
      }
    }

    initializeContract();
    getBalanceMNBC();


  }, []); // Run the effect only on the initial render

  return (
    <div className="App">
      <h1>How to use web3.js</h1>

      <h2>MNBC (ERC20) Balance</h2>
      <p id="balance">{balanceMNBC}</p>
    </div>
  );
}

export default App;