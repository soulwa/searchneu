import React from 'react'
import Section from '../../classModels/Section'

interface WeekdayBoxesProps {
  section: Section
}

function WeekdayBoxes({ section }: WeekdayBoxesProps) {
  const checked = section.getDaysOfWeekAsBooleans()
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className='WeekdayBoxes'>
      {
      checked.map((box, index) => {
        return (
        // eslint-disable-next-line react/no-array-index-key
          <span key={ index } className={ `WeekdayBoxes__box${box ? '--checked' : ''}` }>
            {days[index]}
          </span>
        )
      })
}
    </div>
  )
}

export default WeekdayBoxes
