import React from 'react'
import Section from '../../classModels/Section';


interface UseSectionPanelDetailReturn {
  renderTimes: () => JSX.Element[][];
  getSeatsClass: () => string;
}


export default function useSectionPanelDetail(section: Section): UseSectionPanelDetailReturn {
  const renderTimes = () => {
    return section.meetings.map((meeting) => {
      return meeting.times.map((time, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={ index }>
          <span>
            {`${time.start.format('h:mm')}-${time.end.format('h:mm a')} | ${meeting.getLocation()}`}
          </span>
          <br />
        </React.Fragment>
      ))
    })
  }

  const getSeatsClass = () => {
    const seatingPercentage = section.seatsRemaining / section.seatsCapacity
    if (seatingPercentage > (2 / 3)) {
      return 'green'
    } if (seatingPercentage > (1 / 3)) {
      return 'yellow'
    }
    return 'red'
  }

  return {
    renderTimes: renderTimes,
    getSeatsClass: getSeatsClass,
  }
}
