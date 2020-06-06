import React from 'react'
import Section from '../../classModels/Section'
import WeekdayBoxes from './WeekdayBoxes'
import NotifCheckBox from '../../panels/NotifCheckBox'
import IconGlobe from '../../images/IconGlobe'

interface MobileSectionPanelProps {
  section: Section
  showNotificationSwitches: boolean
}

function MobileSectionPanel({section, showNotificationSwitches} : MobileSectionPanelProps) {
  const getSeatsClass = () => {
    const seatingPercentage = section.seatsRemaining / section.seatsCapacity
    if (seatingPercentage > (2 / 3)) {
      return 'green'
    } if (seatingPercentage > (1 / 3)) {
      return 'yellow'
    }
    return 'red'
  }

  const renderTimes = () => {
    return section.meetings.map((meeting) => {
      return meeting.times.map((time) => (
        <>
          <span>
            {`${time.start.format('h:mm')}-${time.end.format('h:mm a')} | ${meeting.getLocation()}`}
          </span>
          <br />
        </>
      ))
    })
  }

  return (
    <div className='MobileSectionPanel'>
      <div className='MobileSectionPanel__header'>
        <span>{section.getProfs().join(', ')}</span>
        <span>Boston</span>
      </div>
      <div className='MobileSectionPanel__firstRow'>
        <IconGlobe/>
        <span>{section.crn}</span>
      </div>
      <div className='MobileSectionPanel__secondRow'>
        <WeekdayBoxes section={section}/>
      </div>

    </div>
  )

}

export default MobileSectionPanel