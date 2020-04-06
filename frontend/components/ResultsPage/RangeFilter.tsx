import React, { useEffect, useState } from 'react';
import { ClassRange } from './filters';
import '../../css/_Filters.scss';

interface RangeFilterProps {
  title: string,
  selected: ClassRange,
  setActive: (a:ClassRange)=>void
}

export default function RangeFilter({ title, selected, setActive }: RangeFilterProps) {
  const [controlledInput, setControlledInput] = useState(selected);

  useEffect(() => {
    setControlledInput(selected)
  }, [selected]);

  // @ts-ignore
  return (
    <div className='RangeFilter'>
      <div className='RangeFilter__title'>
        <p>
          {title}
        </p>
      </div>
      <div className='RangeFilter__input'>
        <div className='RangeFilter__range-min'>
          <input
            type='string'
            className='RangeFilter__input-box'
            placeholder='Min'
            value={ controlledInput.min }
            onChange={ (event) => setControlledInput({ min:event.target.value, max: controlledInput.max }) }
          />
        </div>
        <div className='RangeFilter__range-max'>
          <input
            type='string'
            className='RangeFilter__input-box'
            placeholder='Max'
            value={ controlledInput.max }
            onChange={ (event) => setControlledInput({ min: controlledInput.min, max:event.target.value }) }
          />
        </div>
        <div
          role='button'
          tabIndex={ 0 }
          className='RangeFilter__apply-input'
          onClick={ () => setActive({ min: controlledInput.min || '0', max: controlledInput.max || '9999' }) }>
          <p>Apply</p>
        </div>
      </div>
    </div>
  );
}
