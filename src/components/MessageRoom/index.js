import React, { useEffect, useState } from 'react';
import Chat from "../../abis/Chat.json";

import ChatUI from "./Chat";
import Sidebar from './Sidebar';

const MessageRoom = ({
  userAddress,
  userBalance
}) =>  {

  const debug = false;

  const [chatContract, setChatContract] = useState(null);
  const [isListenersActive, setIsListenersActive] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [recipientAddress, setRecipientAddress] = useState(null);

  // I think below line is temporary, not sure how to coordinate both "didReceiveMessage" and "didFetchAllMessages"
  const [fullMessageList, setFullMessageList] = useState([]);

  useEffect(() => {
    if (!chatContract) fetchSmartContract();
    else loadEverything();
  }, [chatContract]);

  const loadEverything = async () => {
    try {
      await setupListeners();
      await fetchAddresses();
    } catch(err) {
      console.error(err);
    }
  }

  const setupListeners = async () => {
    try {
      // listen for new messages
      await chatContract.events.messageSentEvent({})
        .on('data', didReceiveMessage)
        .on('error', (err) => { console.error("An error occured while receiving a new message!", err)} );

      // listen for fetch message return value
      await chatContract.events.messagesFetchAllEvent({})
        .on('data', didFetchAllMessages)
        .on('error', (err) => { console.error("An error occured while fetching all messages!", err)} );
      setIsListenersActive(true);
    } catch(err) {
      console.error("error setting up listeners", err);
      setIsListenersActive(false);
      throw err;
    }
  }

  // Function for listening to new message
  const didReceiveMessage = async (event) => {
    const message = event.returnValues.message;
    const isOwn = event.returnValues.from.toLowerCase() === userAddress.toLowerCase();
    
    const ml = fullMessageList;
    // decrypt here for "msg"
    ml.push(
      {
        msg: message,
        isOwn: isOwn
      }
    );

    setFullMessageList(ml);
    // updateUI();
  }

  // Function to handle messages fetch
  const didFetchAllMessages = async (event) => {
    const messages = event.returnValues.messages;
    console.log("fetching:", { messages })

    const ml = [];

    // decrypt here for "msg"
    messages.forEach((m) => {
      ml.push({
        msg: m['message'],
        isOwn: m['from'].toLowerCase() === userAddress.toLowerCase(),
      })
    })
    setFullMessageList(ml);
    // updateUI();
  }


  // Fetches the smart contract object
  const fetchSmartContract = async () => {
    try {
      const networkId = await window.web3.eth.net.getId();
      const chatData = Chat.networks[networkId];
      const chatAbi = Chat.abi;

      if (!chatData) throw Error("Chat contract not deployed");

      const contract = await new window.web3.eth.Contract(chatAbi, chatData.address);
      setChatContract(contract);
      console.log("fetched smart contract!", contract)
    } catch (err) {
      console.error(err);
    }
  }

  // Fetches all user addresses
  const fetchAddresses = async () => {
    const addresses = await window.web3.eth.getAccounts();
    setAddresses(addresses);
    // TODO: allow recipient to change
    // setRecipientAddress(addresses[1]);
    return addresses;
  }

  // Sends a message
  const requestSendMessage = async (message) => {
    // encrypt here
    await chatContract.methods.sendMessage(recipientAddress, message).send({
      from: userAddress, gas: 1500000
    });
    const ml = fullMessageList;
    ml.push({
      msg: message,
      isOwn: true,
    })
    setFullMessageList(ml);
    
  } 

  // Sends a message
  const requestGetAllMessages = async () => {
    await chatContract.methods.getAllMessages(recipientAddress).send({
      from: userAddress, gas: 1500000
    });
  }
  const requestGetAllMessagesWAdd = async (newAdd) => {
    await chatContract.methods.getAllMessages(newAdd).send({
      from: userAddress, gas: 1500000
    });
  }

  const testFunction = async () => {
    const testMsg = "Test message";
    console.log(`Sending test message to ${recipientAddress}: "${testMsg}"`);
    // ** CALL ENCRYPT HERE **
    // const testPackageEncrypted = await m.ratchetEncrypt(testMsg);
    // const { cipherText: testMsgEncrypted, ...headers } = testPackageEncrypted;
    // console.log(`### ecrpyted message: ${testMsgEncrypted}`)
    // await requestSendMessage(testMsg, JSON.stringify(headers));
    // await requestGetAllMessages();
  }

  const getNewMessages = (newAddress) => {
    setRecipientAddress(newAddress);
    requestGetAllMessagesWAdd(newAddress);
  }

  return (

    <div>
      {/* Debugging Code: To turn on, set debug to true*/}
      {debug &&
      <div>
        <h3>Messaging Info</h3>
        <div>Recipient address: {recipientAddress}</div>
        <div>All Available Addresses:</div>
        <ul>{addresses.map((add) => <li key={add}>{String(add)}</li>)}</ul>
        <h3>Test Info</h3>
        {/* <div>isMessengerAvailable: {String(currMessenger !== null)}</div> */}
        <div>isContractAvailable: {String(chatContract !== null)}</div>
        <div>isListenersActive: {String(isListenersActive)}</div>
        <button onClick={testFunction}>Send Test message</button>
        <button onClick={requestGetAllMessages}>Fetch messages</button>

        <h3>Messages</h3>
        <ul>{fullMessageList.map((m, i) =>
          <li key={i}>{m.isOwn ? 'You sent:' : 'They sent:'} {m.msg}</li>
        )}</ul>
      </div>
    }


    {/* Actual UI */}
      <div className='UI'>
        <div className="container">
          <Sidebar
            addresses={addresses}
            newRecipient={getNewMessages}
            userAddress={userAddress}
            userBalance={userBalance}
          />
          <ChatUI
            messageList={fullMessageList}
            address={recipientAddress}
            send={requestSendMessage}
          />
        </div>        
      </div>
    </div>



  )
}

export default MessageRoom