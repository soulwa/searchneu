import React from 'react';
import RadioButtonGroup from './RadioButtonGroup';
import { Option } from './filters';
import '../../css/_Filters.scss';

interface RadioButtonFilterProps {
  title: string,
  options: Option[],
  selected: string,
  setActive: (a:string) => void
}

export default function RadioButtonFilter({
  title, options, selected, setActive,
}: RadioButtonFilterProps) {
  return (

    <div className='RadioButtonFilter'>
      <span className='RadioButtonFilter__title'>{title}</span>
      <RadioButtonGroup name='RadioButtonFilter' value={ selected } onChange={ setActive }>
        {(RadioButton) => (
          <>
            {options.map((option) => (
              <div key={ option.value } className='RadioButtonFilter__element'>
                <label className='RadioButtonFilter__text'>
                  <RadioButton value={ option.value } />
                  <span className='CheckboxFilter__checkbox' />
                  {option.value}
                  <span className='CheckboxFilter__count'>
                    {option.count}
                  </span>
                </label>
              </div>
            ))}
          </>
        )}
      </RadioButtonGroup>
    </div>
  )
}
