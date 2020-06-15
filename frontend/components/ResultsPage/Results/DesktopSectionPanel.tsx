import React from 'react'
import Section from '../../classModels/Section'
import WeekdayBoxes from './WeekdayBoxes'
import NotifCheckBox from '../../panels/NotifCheckBox'
import useSectionPanelDetail from './useSectionPanelDetail';

interface DesktopSectionPanelProps {
  section: Section
  showNotificationSwitches: boolean

}


function DesktopSectionPanel({ section, showNotificationSwitches } : DesktopSectionPanelProps) {
  const { renderTimes, getSeatsClass } = useSectionPanelDetail(section)

  return (
    <tr className='DesktopSectionPanel' key={ section.getHash() }>
      <td>
        {section.crn}
      </td>
      <td>
        {section.getProfs().join(', ')}
      </td>
      <td>
        <div className='DesktopSectionPanel__meetings'>
          {section.online ? <span>Online Class</span> : <WeekdayBoxes section={ section } />}
          <div className='DesktopSectionPanel__times'>
            {renderTimes()}
          </div>
        </div>
      </td>
      <td>
        Boston
      </td>
      <td>
        <span className={ getSeatsClass() }>
          {section.seatsRemaining}/{section.seatsCapacity}
        </span>
        <br />
        <span>
          {`${section.waitRemaining}/${section.waitCapacity} Waitlist Seats`}
        </span>
      </td>
      {showNotificationSwitches && <td><NotifCheckBox section={ section } /></td>}
    </tr>

  )
}

export default DesktopSectionPanel
