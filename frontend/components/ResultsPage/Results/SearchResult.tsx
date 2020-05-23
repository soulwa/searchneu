import React from 'react'
import Course from '../../classModels/Course';
import { History } from 'history';
import IconGlobe from '../../images/IconGlobe'

interface SearchResultProps {
    aClass: Course,
    history:  History
}
export default function SearchResult({aClass, history} : SearchResultProps) {

    const today = new Date()
    const lastUpdated = Math.round((today.getTime() - aClass.lastUpdateTime) / 3600000)
    return (
        <div className="SearchResult">
            <div className='SearchResult__header'>
            <span className='SearchResult__header--classTitle'>
                {aClass.subject} {aClass.classId}: {aClass.name}
            </span>
            <span className='SearchResult__header--creditString'>
              {aClass.maxCredits ===  aClass.minCredits ? `${aClass.maxCredits} CREDITS` : `${aClass.maxCredits}-${aClass.maxCredits} CREDITS`}
            </span>
            <div className='SearchResult__header--sub'>
            <a
              target='_blank'
              rel='noopener noreferrer'
              data-tip={ `View on ${aClass.host}` }
              href={ aClass.prettyUrl }
            >
              <IconGlobe/>
              </a>
              <span>{`Updated ${(lastUpdated)} hours ago`}</span>
            </div>
            </div>
        </div>

    )



}

