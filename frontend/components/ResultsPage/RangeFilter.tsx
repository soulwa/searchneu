import React, {useEffect, useState} from 'react';
import '../../css/_Filters.scss';

interface RangeFilterProps {
  title: string,
  selected: {min:number, max:number},
  setActive: (a:{min:number, max:number})=>void
}

export default function RangeFilter({ title, selected, setActive }: RangeFilterProps) {
  const [controlledInput, setControlledInput] = useState(selected);

  useEffect(() => {
    setControlledInput(selected)
  }, [selected]);

  return (
    <div className='RangeFilter'>
      <div className='RangeFilter__title'>
        <p>
          {title}
        </p>
      </div>
      <div className='RangeFilter__input'>
        <div className='RangeFilter__range-min'>
          <label className='RangeFilter__label-min'>From: </label>
          <input
            type='string'
            className='RangeFilter__input-box'
            placeholder='0'
            value={ controlledInput.min ? controlledInput.min : '' }
            onChange={ (event) => setControlledInput({ min:Number(event.target.value), max: (controlledInput.max ? controlledInput.max : null) }) }
          />
        </div>
        <div>
          <label className='RangeFilter__label-max'>To: </label>
          <input
            type='string'
            className='RangeFilter__input-box'
            placeholder='9999'
            value={ controlledInput.max ? controlledInput.max : '' }
            onChange={ (event) => setControlledInput({ min: (controlledInput.min ? controlledInput.min : null), max:Number(event.target.value) }) }
          />
        </div>
        <div className='RangeFilter__apply-input' onClick={ () => setActive(controlledInput) }>
          <p>Apply</p>
        </div>
      </div>
    </div>
  );
}
