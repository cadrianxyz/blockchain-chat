import React from 'react'

const SearchUser = (props) => {
  return (
    <div className='SearchUser'>
        <div className="searchform">
            <form onSubmit={props.searchUser}>
              <input className='searchforminput' type="text" placeholder='Find a user'/>
              <input type="submit" value="Submit" />
            </form>
        </div>
    </div>
  )
}

export default SearchUser