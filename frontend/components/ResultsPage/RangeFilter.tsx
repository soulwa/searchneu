import React, { useState } from 'react';
import '../../css/_Filters.scss';
import _ from 'lodash';

interface RangeFilterProps {
  title: string,
  active: string[],
  setActive: (a:boolean)=>void
}

export default function RangeFilter({ title, active, setActive }: RangeFilterProps) {
  const [id] = useState(_.uniqueId('react-range-'));
  return (
    <div className='rangeFilter'>
      <div className='toggleName'>
        <p>
          {title}
        </p>
      </div>
      <div className='rangeInput'>
      </div>
    </div>
  );
}
