import React from 'react'

function ChatUsers(props) {
  return (
    <div className="chats">
        <div className="userChat" onClick={props.handleClick}>
            <div className="userChatInfo">
            <span>{props.addr}</span>
            </div>
        </div>
    </div>
  )
}

export default ChatUsers