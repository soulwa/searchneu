import React from 'react'
import { History } from 'history'
import macros from '../../macros'
import DesktopSectionPanel from './DesktopSectionPanel'
import RequisiteBranch from '../../classModels/RequisiteBranch'
import Course from '../../classModels/Course'
import IconGlobe from '../../images/IconGlobe'

interface SearchResultProps {
  aClass: Course,
  history: History
}
export default function SearchResult({ aClass, history } : SearchResultProps) {
  const feeString = aClass.feeDescription && aClass.feeAmount ? `${aClass.feeDescription}- $${aClass.feeAmount}` : null


  const optionalDisplay = (prereqType, aClass) => {
    let data = getReqsString(prereqType, aClass);

    return data;
  }

  // returns an array made to be rendered by react to display the prereqs
  const getReqsString = (reqType, aClass) => {
    const retVal = [];

    // Keep track of which subject+classId combonations have been used so far.
    // If you encounter the same subject+classId combo in the same loop, skip the second one.
    // This is because there is no need to show (eg. CS 2500 and CS 2500 (hon)) in the same group
    // because only the subject and the classId are going to be shown.
    const processedSubjectClassIds = {};

    let childNodes;

    if (reqType === macros.prereqTypes.PREREQ) {
      childNodes = aClass.prereqs;
    } else if (reqType === macros.prereqTypes.COREQ) {
      childNodes = aClass.coreqs;
    } else if (reqType === macros.prereqTypes.PREREQ_FOR) {
      childNodes = aClass.prereqsFor;
    } else if (reqType === macros.prereqTypes.OPT_PREREQ_FOR) {
      childNodes = aClass.optPrereqsFor;
    } else {
      macros.error('Invalid prereqType', reqType);
    }

    childNodes.values.forEach((childBranch) => {
      // If the childBranch is a class
      if (!(childBranch instanceof RequisiteBranch)) {
        if (childBranch.isString) {
          // Skip if already seen
          if (processedSubjectClassIds[childBranch.desc]) {
            return;
          }
          processedSubjectClassIds[childBranch.desc] = true;
          retVal.push(childBranch.desc);
        } else {
          // Skip if already seen
          if (processedSubjectClassIds[childBranch.subject + childBranch.classId]) {
            return;
          }
          processedSubjectClassIds[childBranch.subject + childBranch.classId] = true;

          // When adding support for right click-> open in new tab, we might also be able to fix the jsx-a11y/anchor-is-valid errors.
          // They are disabled for now.
          const hash = `/${aClass.termId}/${childBranch.subject}${childBranch.classId}`;

          const element = (
            <a
              role='link'
              tabIndex={0}
              onClick={ (event) => { onReqClick(reqType, childBranch, event, hash); } }
            >
              {`${childBranch.subject} ${childBranch.classId}`}
            </a>
          );

          retVal.push(element);
        }
      } else if (reqType === macros.prereqTypes.PREREQ) {
        // Figure out how many unique classIds there are in the prereqs.
        const allClassIds = {};
        for (const node of childBranch.prereqs.values) {
          allClassIds[node.classId] = true;
        }

        // If there is only 1 prereq with a unique classId, don't show the parens.
        if (Object.keys(allClassIds).length === 1) {
          retVal.push(getReqsString(macros.prereqTypes.PREREQ, childBranch));
        } else {
          retVal.push(['(', getReqsString(macros.prereqTypes.PREREQ, childBranch), ')']);
        }
      } else {
        macros.error('Branch found and parsing coreqs?', childBranch);
      }
    })


    // Now insert the type divider ("and" vs "or") between the elements.
    // If we're parsing prereqsFor, we should use just a comma as a separator.
    // Can't use the join in case the objects are react elements
    if (reqType === macros.prereqTypes.PREREQ_FOR || reqType === macros.prereqTypes.OPT_PREREQ_FOR) {
      for (let i = retVal.length - 1; i >= 1; i--) {
        retVal.splice(i, 0, ', ');
      }
    } else {
      let type;
      if (reqType === macros.prereqTypes.PREREQ) {
        type = aClass.prereqs.type;
      } else if (reqType === macros.prereqTypes.COREQ) {
        type = aClass.coreqs.type;
      }
      for (let i = retVal.length - 1; i >= 1; i--) {
        retVal.splice(i, 0, ` ${type} `);
      }
    }

    if (retVal.length === 0) {
      return (
        <span className='empty'>
          None
        </span>
      );
    }

    return retVal;
  }

  const onReqClick = (reqType, childBranch, event, hash) => {
    history.push(hash);

    // Create the React element and add it to retVal
    const searchEvent = new CustomEvent(macros.searchEvent, { detail: `${childBranch.subject} ${childBranch.classId}` });
    window.dispatchEvent(searchEvent);
    event.preventDefault();

    // Rest of this function is analytics
    const classCode = `${childBranch.subject} ${childBranch.classId}`;
    let reqTypeString;

    switch (reqType) {
      case macros.prereqTypes.PREREQ:
        reqTypeString = 'Prerequisite';
        break;
      case macros.prereqTypes.COREQ:
        reqTypeString = 'Corequisite';
        break;
      case macros.prereqTypes.PREREQ_FOR:
        reqTypeString = 'Required Prerequisite For';
        break;
      case macros.prereqTypes.OPT_PREREQ_FOR:
        reqTypeString = 'Optional Prerequisite For';
        break;
      default:
        macros.error('unknown type.', reqType);
    }

    macros.logAmplitudeEvent('Requisite Click', {
      type: reqTypeString,
      subject: childBranch.subject,
      classId: childBranch.classId,
      classCode: classCode,
    });
  }

  console.log(`prereqs for ${aClass.name}`,aClass.prereqs)
  console.log(`coreqs for ${aClass.name}`, aClass.coreqs)
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
      <table className='ui celled striped table SearchResult__sectionTable'>
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
    </div>

  )
}
