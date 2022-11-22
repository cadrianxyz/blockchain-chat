import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';

import MessageRoom from "./MessageRoom/index";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userPubAddress, setUserPubAddress] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  
  useEffect(() => {
    loadEverything();
  }, []);

  const loadEverything = () => {
    loadWeb3();
  }

  const loadWeb3 = async () => {
    if (window.ethereum) { // if metamask exists
      try {
        console.log("Connecting to Metamask wallet...");
        const address = await window.ethereum.enable();
        setUserPubAddress(address);

        console.log(`Connecting to local Ganache chain with address ${address}... `);
        window.web3 = new Web3(Web3.providers.WebsocketProvider("ws://localhost:7545"));

        console.log("Loading address data...");
        const ethBalance = await window.web3.eth.getBalance(String(address));
    setUserBalance(ethBalance);

        setIsConnected(true);
      }
      catch (err) {
        console.error(err);
        setIsConnected(false);
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      setIsConnected(false);
      console.error("No metamask or existing web3 provider detected");
    }
  }

  return (
    <div>
      <h1>YO</h1>
      {isConnected &&
        <MessageRoom
          userAddress={userPubAddress}
        />
      }
    </div>
  )
}

export default App;
