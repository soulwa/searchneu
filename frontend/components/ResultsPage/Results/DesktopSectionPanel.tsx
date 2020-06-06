import React, { useState } from 'react'
import Section from '../../classModels/Section'
import WeekdayBoxes from './WeekdayBoxes'
import NotifCheckBox from '../../panels/NotifCheckBox'

interface DesktopSectionPanelProps {
  section: Section
  showNotificationSwitches: boolean
  
}


function DesktopSectionPanel({section, showNotificationSwitches} : DesktopSectionPanelProps) {

  
  const renderTimes = () => {
    return section.meetings.map((meeting) => {
      return meeting.times.map((time) => (
        <>
        <span>
          {`${time.start.format('h:mm')}-${time.end.format('h:mm a')} @ ${meeting.getLocation()}`}
        </span>
        <br/>
        </>
      ))
    }
    )
  }
  const getSeatsClass = () => {
    const seatingPercentage = section.seatsRemaining/section.seatsCapacity
    if(seatingPercentage > (2/3)) {
      return 'green'
    } else if(seatingPercentage > (1/3)) {
      return 'yellow'
    } else {
      return 'red'
    }
    
  }

  return(
    <tr className='DesktopSectionPanel'key={section.getHash()}>
         <td>
          {section.crn}
        </td>
        <td>
          {section.getProfs().join(', ')}
        </td>
        <td>
        <div className='DesktopSectionPanel__meetings'>
          {section.online ? <span>Online Class</span> : <WeekdayBoxes section={section}/>}
          <div className='DesktopSectionPanel__times'>
            {renderTimes()}
          </div>
        </div>
        </td>
        <td>
          Boston
        </td>
        <td>
          <span className={getSeatsClass()}>
            {section.seatsRemaining}/{section.seatsCapacity}
          </span>
          <br/>
          <span>
            {`${section.waitRemaining}/${section.waitCapacity} Waitlist Seats`}
          </span>
        </td>
        {showNotificationSwitches && <td><NotifCheckBox section={section}/></td>}
    </tr>

  )

}

export default DesktopSectionPanel