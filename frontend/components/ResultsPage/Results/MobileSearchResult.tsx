import React, { useState } from 'react'
import { History } from 'history'
import Course from '../../classModels/Course'
import IconCollapseExpand from '../../images/IconCollapseExpand'
import IconArrow from '../../images/IconArrow'
import useResultRequisite from './useResultRequisite'
import useUserChange from './useUserChange'
import useShowAll from './useShowAll'
import macros from '../../macros'
import MobileSectionPanel from './MobileSectionPanel'
import SignUpForNotifications from '../../SignUpForNotifications'


interface MobileSearchResultProps {
  aClass: Course,
  history: History,
}

function MobileSearchResult({ aClass, history } : MobileSearchResultProps) {
  const [expanded, setExpanded] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showNUPath, setShowNUPath] = useState(false)
  const [showPrereq, setShowPrereq] = useState(false)
  const [showCoreq, setShowCoreq] = useState(false)
  const userIsWatchingClass = useUserChange(aClass)
  const {
    showAll, setShowAll, renderedSections, hideShowAll,
  } = useShowAll(aClass)

  const optionalDisplay = useResultRequisite(history);


  return (
    <div className='MobileSearchResult'>
      <div className={ expanded ? 'MobileSearchResult__header--expanded' : 'MobileSearchResult__header' } role='button' tabIndex={ 0 } onClick={ () => setExpanded(!expanded) }>
        <IconCollapseExpand />
        <span className='MobileSearchResult__header--classTitle'>
          {`${aClass.subject} ${aClass.classId} : ${aClass.name}`}
        </span>
      </div>
      {expanded && (
      <div className='MobileSearchResult__panel'>
        <div className='MobileSearchResult__panel--mainContainer'>
          <div className='MobileSearchResult__panel--infoStrings'>
            <a href={ aClass.prettyUrl }>{`Updated ${(aClass.getLastUpdateString())}`}</a>
            <span>
              {aClass.maxCredits === aClass.minCredits ? `${aClass.maxCredits} Credits` : `${aClass.maxCredits}-${aClass.maxCredits} Credits`}
            </span>
          </div>
          <div className={ showMore ? 'MobileSearchResult__panel--description' : 'MobileSearchResult__panel--descriptionHidden' }>
            {aClass.desc}
          </div>
          <div className='MobileSearchResult__panel--showMore' role='button' tabIndex={ 0 } onClick={ () => setShowMore(!showMore) }>{showMore ? 'Show less' : 'Show more'}</div>
          <div className='MobileSearchResult__panel--collapsableContainer' role='button' tabIndex={ 0 } onClick={ () => setShowNUPath(!showNUPath)}>
            <div className='MobileSearchResult__panel--collapsableTitle'>
              <IconCollapseExpand width='6' height='12' fill='#000000' className={ showNUPath && 'MobileSearchResult__panel--rotatedIcon' } />
              <span>NUPATHS</span>
            </div>
            {showNUPath && <div>{aClass.nupath.length > 0 ? <div> {aClass.nupath.join(', ')}</div> : <span className='empty'> None</span>}</div>}
          </div>
          <div className='MobileSearchResult__panel--collapsableContainer' role='button' tabIndex={ 0 } onClick={ () => setShowPrereq(!showPrereq) }>
            <div className='MobileSearchResult__panel--collapsableTitle'>
              <IconCollapseExpand width='6' height='12' fill='#000000' className={ showPrereq && 'MobileSearchResult__panel--rotatedIcon' } />
              <span>PREREQUISITES</span>
            </div>
            {showPrereq && <div>{optionalDisplay(macros.prereqTypes.PREREQ, aClass)}</div>}
          </div>
          <div className='MobileSearchResult__panel--collapsableContainer' role='button' tabIndex={ 0 } onClick={ () => setShowCoreq(!showCoreq) }>
            <div className='MobileSearchResult__panel--collapsableTitle'>
              <IconCollapseExpand width='6' height='12' fill='#000000' className={ showCoreq && 'MobileSearchResult__panel--rotatedIcon' } />
              <span>COREQUISITES</span>
            </div>
            {showCoreq && <div>{optionalDisplay(macros.prereqTypes.COREQ, aClass)}</div>}
          </div>
          <div className='MobileSearchResult__panel--notifContainer'>
            <SignUpForNotifications aClass={ aClass } userIsWatchingClass={ userIsWatchingClass } />
          </div>
        </div>
        <div className='MobileSearchResult__panel--sections'>
          {
            renderedSections.map((section) => (
              <MobileSectionPanel
                key={ section.crn }
                section={ section }
                showNotificationSwitches={ userIsWatchingClass }
              />
            ))
          }
        </div>
        {!hideShowAll && (
        <div className='MobileSearchResult__showAll' role='button' tabIndex={ 0 } onClick={ () => setShowAll(!showAll) }>
          <span>{showAll ? 'Collapse sections' : 'Show all sections'}</span>
          <IconArrow className={ showAll && 'MobileSearchResult__showAll--collapse' } />
        </div>
        )}
      </div>
      )}
    </div>

  )
}

export default MobileSearchResult
