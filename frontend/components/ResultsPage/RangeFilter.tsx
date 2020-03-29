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
      <div className='range-input'>
        <label className='label-min'>Minimum</label>
        <input type='number' className='input-min' value={ selected.min } onChange={ (event) => setActive({ min:Number(event.target.value), max:selected.max }) } />
        <label className='label-max'>Maximum</label>
        <input type='number' className='input-max' value={ selected.max } onChange={ (event) => setActive({ min: selected.min, max:Number(event.target.value) }) } />
      </div>
    </div>
  );
}
