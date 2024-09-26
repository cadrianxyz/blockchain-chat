import React from 'react'

const Message = ({ text, isOwn }) => {
  // if (msg.youSent)
  if (isOwn)
    return (
        <div className='message owner'>
          <div className="messageContent">
              <p>{text}</p>
          </div>
      </div>
    );
  else
      return (
        <div className='message'>
          <div className="messageContent">
          <p>{text}</p>
          </div>
      </div>
      );
}

export default Message