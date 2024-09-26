import React from 'react'
import Input from './Input'
import Messages from './Messages'

const ChatUI = ({ messageList, address, send }) => {
  // const [addr, setAddr] = useState([]);
  // useEffect(() => {
  //   fetch('/chat/chatAddress')
  //     .then(res => res.json())
  //     .then(setAddr);
  // }, []);

  return (
    <div className='chatui'>
      <span className="chatHeader">{address ? `Conversation with ${address}` : ""}</span>
        {address ? <>
              
            {/* {addr.map(x => <Messages address={x} />)} */}
            <Messages messages={messageList} />
            <Input submit={send}/>
          </>
          : <h1>No recipient selected</h1>
        }
    </div>
  )
}

export default ChatUI