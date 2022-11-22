import React, { useEffect, useState } from 'react'
import Chat from "../../abis/Chat.json"

const MessageRoom = ({
  userAddress
}) =>  {

  useEffect(() => {
    loadEverything();
  }, []);

  const loadEverything = async () => {
    const contract = await fetchSmartContract();
    await fetchAddresses();
    await waitForMessage(contract);
  }

  const [addresses, setAddresses] = useState([]);
  const [recipientAddress, setRecipientAddress] = useState(null);
  const [chatContract, setChatContract] = useState(null);

  const [messageList, setMessageList] = useState([]);

  const fetchSmartContract = async () => {
    const networkId = await window.web3.eth.net.getId();
    const chatData = Chat.networks[networkId];
    const chatAbi = Chat.abi;

    if (chatData) {
      const contract = await new window.web3.eth.Contract(chatAbi, chatData.address);
      setChatContract(contract);
      return contract;
    }
    else {
      console.error("Chat contract not deployed");
    }
  }

  // Fetches all user addresses
  const fetchAddresses = async () => {
    const addresses = await window.web3.eth.getAccounts();
    setAddresses(addresses);
    setRecipientAddress(addresses[0]);
  }

  // Sends a message
  const didSendMessage = async (message) => {
    await chatContract.methods.sendMessage(recipientAddress, message).send({
      from: userAddress, gas: 1500000
    });
  } 

  // Listen for new messages
  const waitForMessage = async (contract) => {
    contract.events.messageSentEvent({})
      .on('data', didReceiveMessage)
      .on('error', console.error);
  }

  // Function for listening to new message
  const didReceiveMessage = async (event) => {
    const message = event.returnValues.message;
    const isOwn = event.returnValues.from === userAddress;

    const ml = messageList;
    ml.push(
      {
        msg: message,
        isOwn: isOwn
      }
    )

    setMessageList(ml);
    // updateUI();
  }

  return (
    <div>{addresses.map((add) => <h2>{JSON.stringify(add)}</h2>)}</div>
  )
}

export default MessageRoom