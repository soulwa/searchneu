import React, { useState } from 'react'
import Course from '../../classModels/Course'
import IconGlobe from '../../images/IconGlobe'
import IconCollapseExpand from '../../images/IconCollapseExpand'
import IconArrow from '../../images/IconArrow'
import { History } from 'history'
import useResultRequisite from './useResultRequisite'
import macros from '../../macros'


interface MobileSearchResultProps {
  aClass: Course,
  history: History,
}

function MobileSearchResult({aClass, history} : MobileSearchResultProps) {

  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className='MobileSearchResult'>
      <div className={expanded ? 'MobileSearchResult__header--expanded' : 'MobileSearchResult__header'} onClick={() => setExpanded(!expanded)}>
      <IconCollapseExpand/>
      <span className='MobileSearchResult__header--classTitle'>
        {`${aClass.subject} ${aClass.classId} : ${aClass.name}`}
      </span>
      </div>
      {expanded && <div className='MobileSearchResult__panel'>
      </div>}
    </div>

  )
}

export default MobileSearchResult