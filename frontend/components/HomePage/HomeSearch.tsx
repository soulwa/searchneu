import React, { useState } from 'react'
import {useHistory} from 'react-router-dom'
import SearchBar from '../ResultsPage/SearchBar'
import TermDropdown from '../ResultsPage/TermDropdown';


interface HomeSearchProps {
  setSearchFocused: (b: boolean) => void
  setTermId: (s: string) => void
  termId: string
}

const HomeSearch = ({setSearchFocused, setTermId, termId}) => {
  const history = useHistory();

  return (
    <div className='HomeSearch'>
      <div
        className='HomeSearch__searchBar'
      >
      <div className='HomeSearch__searchBar--dropdown'>
        <TermDropdown
          termId={ termId }
          onChange={ setTermId }
          compact={false}
        />
      </div>
      <div 
        className='HomeSearch__searchBar--input'
        onFocus={ () => { setSearchFocused(true); } }
        onBlur={ () => { setSearchFocused(false); } }
      >
        <SearchBar
          onSearch={ (q) => { history.push(`/${termId}/${q}`); } }
          query=''
        />
      </div>
    </div>
  </div>


  )
}

export default HomeSearch