import React from 'react'
import { History } from 'history'
import macros from '../../macros'
import DesktopSectionPanel from './DesktopSectionPanel'
import RequisiteBranch from '../../classModels/RequisiteBranch'
import Course from '../../classModels/Course'
import IconGlobe from '../../images/IconGlobe'
import useResultRequisite from './useResultRequisite';

interface SearchResultProps {
  aClass: Course,
  history: History
}
export default function SearchResult({ aClass, history } : SearchResultProps) {
  const feeString = aClass.feeDescription && aClass.feeAmount ? `${aClass.feeDescription}- $${aClass.feeAmount}` : null
  const optionalDisplay = useResultRequisite(history);

  console.log('class', aClass)



  return (
    <div className='SearchResult'>
      <div className='SearchResult__header'>
        <span className='SearchResult__header--classTitle'>
          {aClass.subject} {aClass.classId}: {aClass.name}
        </span>
        <span className='SearchResult__header--creditString'>
          {aClass.maxCredits === aClass.minCredits ? `${aClass.maxCredits} CREDITS` : `${aClass.maxCredits}-${aClass.maxCredits} CREDITS`}
        </span>
        <div className='SearchResult__header--sub'>
          <a
            target='_blank'
            rel='noopener noreferrer'
            data-tip={ `View on ${aClass.host}` }
            href={ aClass.prettyUrl }
          >
            <IconGlobe />
          </a>
          <span>{`Updated ${(aClass.getLastUpdateString())}`}</span>
        </div>
      </div>
      <div className='SearchResult__panel'>
        {aClass.desc}
        <br />
        <br />
        <div className='SearchResult__panel--left'>
          NUPaths:
          {aClass.nupath.length > 0 ? <span> {aClass.nupath.join(', ')}</span> : <span className='empty'> None</span>}
          <br />
          Prerequisites: {optionalDisplay(macros.prereqTypes.PREREQ, aClass)}
          <br />
          Corequisites: {optionalDisplay(macros.prereqTypes.COREQ, aClass)}
          <br />
          Course fees:
          {feeString ? <span>  {feeString}</span> : <span className='empty'> None</span>}
        </div>
      </div>
      <table className='SearchResult__sectionTable'>
        <thead>
          <tr>
            <th>
              <div className='inlineBlock' data-tip='Course Reference Number'>
                CRN
              </div>
            </th>
            <th> Professors </th>
            <th> Meetings </th>
            <th> Campus </th>
            <th> Seats </th>
          </tr>
        </thead>
        <tbody>
        {aClass.sections.map((section) => {
              return (
                <DesktopSectionPanel
                  key={ section.crn }
                  section={ section }
                  showNotificationSwitches={ false }
                />
              );
            })}
        </tbody>
      </table>
      <div className='SearchResult__showAll'>Show all class information</div>
    </div>

  )
}
