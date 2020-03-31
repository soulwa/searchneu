import React from 'react';
import '../../css/_Filters.scss';

interface RangeFilterProps {
  title: string,
  selected: {min:number, max:number},
  setActive: (a:{min:number, max:number})=>void
}

export default function RangeFilter({ title, selected, setActive }: RangeFilterProps) {
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
            value={ selected.min ? selected.min : '' }
            onChange={ (event) => setActive({ min:Number(event.target.value), max: (selected.max ? selected.max : null) }) }
          />
        </div>
        <div>
          <label className='RangeFilter__label-max'>To: </label>
          <input
            type='string'
            className='RangeFilter__input-box'
            placeholder='9999'
            value={ selected.max ? selected.max : '' }
            onChange={ (event) => setActive({ min: (selected.min ? selected.min : null), max:Number(event.target.value) }) }
          />
        </div>
        <input className='RangeFilter__apply-input' type='submit' onChange={ () => setActive({ min: (selected.min ? selected.min : null), max: (selected.max ? selected.max : null) }) } value='Apply' />
      </div>
    </div>
  );
}
