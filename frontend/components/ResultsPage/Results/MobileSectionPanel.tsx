import React from 'react'
import Section from '../../classModels/Section'
import WeekdayBoxes from './WeekdayBoxes'
import NotifCheckBox from '../../panels/NotifCheckBox'
import IconGlobe from '../../images/IconGlobe'
import useSectionPanelDetail from './useSectionPanelDetail';

interface MobileSectionPanelProps {
  section: Section
  showNotificationSwitches: boolean
}

function MobileSectionPanel({ section, showNotificationSwitches } : MobileSectionPanelProps) {
  const { renderTimes, getSeatsClass } = useSectionPanelDetail(section)

  console.log('section', section)

  return (
    <div className='MobileSectionPanel'>
      <div className='MobileSectionPanel__header'>
        <span>{section.getProfs().join(', ')}</span>
        <span>Boston</span>
      </div>
      <div className='MobileSectionPanel__firstRow'>
        <div>
          <IconGlobe />
          <span>{section.crn}</span>
        </div>
        {showNotificationSwitches && <NotifCheckBox section={ section } />}
      </div>
      <div className='MobileSectionPanel__secondRow'>
        <WeekdayBoxes meetingDays={section.getDaysOfWeekAsBooleans()} />
      </div>
      <div className='MobileSectionPanel__meetings'>
        {renderTimes()}
      </div>
      <div className={ getSeatsClass() }>
        {`${section.seatsRemaining}/${section.seatsCapacity} Seats Available `}
      </div>
    </div>
  )
}

export default MobileSectionPanel
