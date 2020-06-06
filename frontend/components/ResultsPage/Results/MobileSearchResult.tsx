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
  const [showMore, setShowMore] = useState(false)
  const [showNUPath, setShowNUPath] = useState(false)
  const [showPrereq, setShowPrereq] = useState(false)
  const [showCoreq, setShowCoreq] = useState(false)
  const optionalDisplay = useResultRequisite(history);
  
  return (
    <div className='MobileSearchResult'>
      <div className={expanded ? 'MobileSearchResult__header--expanded' : 'MobileSearchResult__header'} onClick={() => setExpanded(!expanded)}>
      <IconCollapseExpand/>
      <span className='MobileSearchResult__header--classTitle'>
        {`${aClass.subject} ${aClass.classId} : ${aClass.name}`}
      </span>
      </div>
      {expanded && <div className='MobileSearchResult__panel'>
        <div className='MobileSearchResult__panel--container'>
        <div className='MobileSearchResult__panel--infoStrings'>
        <a href={ aClass.prettyUrl }>{`Updated ${(aClass.getLastUpdateString())}`}</a>
        <span>
          {aClass.maxCredits === aClass.minCredits ? `${aClass.maxCredits} Credits` : `${aClass.maxCredits}-${aClass.maxCredits} Credits`}
        </span>
        </div>
        <div className={showMore ? 'MobileSearchResult__panel--description' : 'MobileSearchResult__panel--descriptionHidden'}>
          {aClass.desc}
        </div>
        <div className='MobileSearchResult__panel--showMore' onClick={() => setShowMore(!showMore)}>{showMore ? 'Show less' : 'Show more'}</div>
        <div className='MobileSearchResult__panel--collapsableContainer'>
          <div className='MobileSearchResult__panel--collapsableTitle' onClick={() => setShowNUPath(!showNUPath)}>
          <IconCollapseExpand width={'6'} height={'12'} fill={'#000000'} className={showNUPath && 'MobileSearchResult__panel--rotatedIcon'}/>
          <span>NUPATHS</span>
          </div>
          {showNUPath && <div>{aClass.nupath.length > 0 ? <div> {aClass.nupath.join(', ')}</div> : <span className='empty'> None</span>}</div>}
        </div>
        <div className='MobileSearchResult__panel--collapsableContainer' onClick={() => setShowPrereq(!showPrereq)}>
          <div className='MobileSearchResult__panel--collapsableTitle'>
          <IconCollapseExpand width={'6'} height={'12'} fill={'#000000'} className={showPrereq && 'MobileSearchResult__panel--rotatedIcon'}/>
          <span>PREREQUISITES</span>
          </div>
          {showPrereq && <div>{optionalDisplay(macros.prereqTypes.PREREQ, aClass)}</div>}
        </div>
        <div className='MobileSearchResult__panel--collapsableContainer' onClick={() => setShowCoreq(!showCoreq)}>
          <div className='MobileSearchResult__panel--collapsableTitle'>
          <IconCollapseExpand width={'6'} height={'12'} fill={'#000000'} className={showCoreq && 'MobileSearchResult__panel--rotatedIcon'}/>
          <span>COREQUISITES</span>
          </div>
          {showCoreq && <div>{optionalDisplay(macros.prereqTypes.COREQ, aClass)}</div>}
        </div>
        </div>
      </div>}
    </div>

  )
}

export default MobileSearchResult