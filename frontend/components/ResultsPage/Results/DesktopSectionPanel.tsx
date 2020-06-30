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

  console.log('section', section)

  const getUniqueTimes = (times) => {
    const seenTimes = new Set()
    return times.reduce((acc, t) => {
      if(!seenTimes.has(t.start.format('h:mm'))) {
        acc.push(t)
      }
      seenTimes.add(t.start.format('h:mm'))
      return acc
    }, [])
  }

  const getMeetings = (daysMet, meeting) => {
    if (daysMet.some((d) => d)) {
      return (
        <div className="DesktopSectionPanel__meetings">
         <WeekdayBoxes meetingDays={ daysMet } />
         <div className="DesktopSectionPanel__meetings--times">
          {getUniqueTimes(meeting.times).map((time) => (
            <>
              <span>
                {`${time.start.format('h:mm')}-${time.end.format('h:mm a')} | ${meeting.getLocation()}`}
              </span>
              <br/>
            </>
            ))}
          </div>
        </div>
      )
    } else if (section.meetings.length === 1) {
        return <span>See syllabus</span>
    }
  }


  return (
    <tr className='DesktopSectionPanel' key={ section.getHash() }>
      <td>
        {section.crn}
      </td>
      <td>
        {section.getProfs().join(', ')}
      </td>
      <td>
        {section.online ? <span>Online Class</span>
          : section.meetings.map((m) => {
              const meetingDays = Array(7).fill(false)
              meetingDays.forEach((d, index) => { if (m.meetsOnDay(index)) meetingDays[index] = true })
              return getMeetings(meetingDays, m)
          })}

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
