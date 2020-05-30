import React from 'react'
import Section from '../../classModels/Section'

interface WeekdayBoxesProps {
  section: Section
}

function WeekdayBoxes({section}: WeekdayBoxesProps) {
  const checked = section.getDaysOfWeekAsBooleans()
  const days = ['S','M','T','W','T','F','S']
  console.log('checked', checked)
  return (
  <div className='WeekdayBoxes'>
    {
      checked.map((box, index) => {
      return(  
      <span className={`WeekdayBoxes__box${box ? '--checked' : ''}`}>
        {days[index]}
      </span>)
    })}
  </div>
  )
}

export default WeekdayBoxes