import React from 'react'
import Message from "./Message"

function Messages({ messages }) {
  // const [messages, setMessages] = useState([]);
  // useEffect(() => {
  //   fetch(`/chat/messages/${props.address}`)
  //     .then(res => res.json())
  //     .then(x => {console.log(x); setMessages(x)});
  // }, []);
  return (
    <div className='messages'>
      {messages.length ? 
        messages.map(x => <Message text={x.msg} isOwn={x.isOwn} />)
         : <div style={{ color: 'white' }}>No messages found</div>
      }
    </div>
  )
}

export default Messages