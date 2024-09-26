import React, { useState } from 'react'

const Input = ({ submit }) => {
  const [msg, setMsg] = useState("");

  return (
    <div className='input'>
        <input type="text" name="" id="" placeholder='Send a message'
          onChange={(e) => { setMsg(e.currentTarget.value)}}
          value={msg}
        />
        <button className='sendbtn' onClick={() => { submit(msg)}}>Send</button>
    </div>
  )
}

export default Input