import React, { useState } from 'react'
import Course from '../../classModels/Course'
import IconCollapseExpand from '../../images/IconCollapseExpand'
import IconArrow from '../../images/IconArrow'
import useResultRequisite from './useResultRequisite'
import useUserChange from './useUserChange'
import useShowAll from './useShowAll'
import macros from '../../macros'
import MobileCollapsableDetail from './MobileCollapsableDetail'
import MobileSectionPanel from './MobileSectionPanel'
import SignUpForNotifications from '../../SignUpForNotifications'


interface MobileSearchResultProps {
  aClass: Course,
}

function MobileSearchResult({ aClass } : MobileSearchResultProps) {
  const [expanded, setExpanded] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showNUPath, setShowNUPath] = useState(false)
  const [showPrereq, setShowPrereq] = useState(false)
  const [showCoreq, setShowCoreq] = useState(false)
  const userIsWatchingClass = useUserChange(aClass)
  const {
    showAll, setShowAll, renderedSections, hideShowAll,
  } = useShowAll(aClass)

  const optionalDisplay = useResultRequisite();


  const renderNUPaths = () => (
    // eslint-disable-next-line react/prop-types
    <div>{aClass.nupath.length > 0 ? <div> {aClass.nupath.join(', ')}</div> : <span className='empty'> None</span>}</div>
  )

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
          <MobileCollapsableDetail title='NUPATH' expand={ showNUPath } setExpand={ setShowNUPath } renderChildren={ renderNUPaths } />
          <MobileCollapsableDetail title='PREREQUISITES' expand={ showPrereq } setExpand={ setShowPrereq } renderChildren={ () => optionalDisplay(macros.prereqTypes.PREREQ, aClass) } />
          <MobileCollapsableDetail title='COREQUISITES' expand={ showCoreq } setExpand={ setShowCoreq } renderChildren={ () => optionalDisplay(macros.prereqTypes.COREQ, aClass) } />
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
          <IconArrow className={ showAll ? 'MobileSearchResult__showAll--collapse' : '' } />
        </div>
        )}
      </div>
      )}
    </div>

  )
}

export default MobileSearchResult
