import React from 'react'
import ChatUsers from './ChatUsers'
import Navbar  from './Navbar'
// import SearchUser from './Search'

const Sidebar = ({
  addresses,
  newRecipient,
  userAddress,
  userBalance
}) => {
  // const [pastChatters, setChatters] = useState([]);

  // useEffect(() => {
  //   fetch('/chat/chatAddress')
  //     .then(res => res.json())
  //     .then(setChatters);
  // }, []);

  return (
    <div className='sidebar'>
        <Navbar/>
        {/* <SearchUser searchUser=""/> */}
        {addresses.map(x => <ChatUsers
          handleClick={() => { newRecipient(x) }}
          addr={x}
          />)}
        <div style={{
          position: "absolute",
          bottom: 0,
          color: "white",
          padding: "10px",
          maxWidth: "calc(100% - 20px)",
          overflow: "hidden",
        }}>
          <div><strong>User</strong>: <span style={{ 
              textOverflow: "ellipsis",
              overflow: "hidden",
              width: "50%",
              whiteSpace: "nowrap",
              display: "inline-block",
              lineHeight: "1em",
            }}>{userAddress}</span>
          </div>
          <div><strong>Balance</strong>: {(userBalance / 1000000000000000000).toFixed(2)}... ETH</div>
        </div>
    </div>
  )
}

export default Sidebar