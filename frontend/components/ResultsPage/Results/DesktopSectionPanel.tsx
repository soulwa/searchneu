import React, { useState } from 'react'
import Section from '../../classModels/Section'
import WeekdayBoxes from './WeekdayBoxes'

interface DesktopSectionPanelProps {
  section: Section
  showNotificationSwitches: boolean
  
}


function DesktopSectionPanel({section, showNotificationSwitches} : DesktopSectionPanelProps) {
  return(
    <tr className='DesktopSectionPanel'key={section.getHash()}>
         <td>
          {section.crn}
        </td>
        <td>
          {section.getProfs().join(', ')}
        </td>
        <td>
          <WeekdayBoxes section={section}/>
        </td>

    </tr>

  )

}

export default DesktopSectionPanel