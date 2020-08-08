import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import SearchBar from '../ResultsPage/SearchBar'
import TermDropdown from '../ResultsPage/TermDropdown';


interface HomeSearchProps {
  setSearchFocused: (b: boolean) => void
  setTermId: (s: string) => void
  termId: string
}

const HomeSearch = ({setSearchFocused, setTermId, termId}) => {
  const history = useHistory();
  const [selectedCampus, setSelectedCampus] = useState('neu');
  console.log('selectedCampus', selectedCampus)

  return (
    <div className='HomeSearch'>
      <div className='HomeSearch__campusSelector'>
          <input type='radio' id='campusSelectorNeu' name='CampusSelector' defaultChecked/>
          <label className='HomeSearch__campusSelector--neu' htmlFor='campusSelectorNeu' onClick={ () => setSelectedCampus('neu') }>
          <span>NEU</span>
          </label>
          <input type='radio' id='campusSelectorCps' name='CampusSelector' />
          <label className='HomeSearch__campusSelector--cps' htmlFor='campusSelectorCps' onClick={ () => setSelectedCampus('cps') }>
            <span>CPS</span>
          </label>
          <input type='radio' id='campusSelectorLaw' name='CampusSelector' />
          <label className='HomeSearch__campusSelector--law' htmlFor='campusSelectorLaw' onClick={ () => setSelectedCampus('law') }>
            <span>Law</span>
          </label>
      </div>
      <div className='HomeSearch__searchBar'>
        <div className='HomeSearch__searchBar--dropdown'>
          <TermDropdown
            termId={ termId }
            onChange={ setTermId }
            compact={false}
          />
        </div>
        <div 
          className='HomeSearch__searchBar--input'
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