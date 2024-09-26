import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';

import MessageRoom from "./MessageRoom/index";
import PasswordForm from './PasswordForm/passwordForm';

const App = () => {
  const debug = false;

  const [isConnected, setIsConnected] = useState(false);
  const [userPubAddress, setUserPubAddress] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isAuth, setIsAuth] = useState(false);

  const auth = async () => {
    setIsAuth(true)
  }
  
  useEffect(() => {
    loadEverything();
  }, []);

  const loadEverything = async () => {
    await loadWeb3();
  }

  const loadWeb3 = async () => {
    if (window.ethereum) { // if metamask exists
      try {
        console.log("Connecting to Metamask wallet...");
        const address = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        setUserPubAddress(address);

        console.log(`Connecting to local Ganache chain with address ${address}... `);
        const wsProvider = new Web3.providers.WebsocketProvider("ws://localhost:7545");
        window.web3 = new Web3(wsProvider);

        console.log("Loading address data...");
        const ethBalance = await window.web3.eth.getBalance(address);
        setUserBalance(ethBalance);

        setIsConnected(true);
      }
      catch (err) {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.error('User denied wallet access!', err);
        }
        else {
          console.error(err);
        }
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
      {isAuth ?
        <>
          {debug && <>
            <h1>Current Address: {userPubAddress}</h1>
            <div>Balance: {userBalance}</div>
          </>}
          {isConnected &&
            <MessageRoom
              userBalance={userBalance}
              userAddress={userPubAddress}
            />
          }
        </>
      : <PasswordForm authCallback={auth} />}
    </div>
    
  )
}

export default App;
