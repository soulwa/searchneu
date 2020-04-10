import React, { useState } from 'react';
import LogoInput from '../images/LogoInput';

export default function FeedbackModal() {
  const [open, setOpen] = useState(false);

  return (
    <div className='FeedbackModal'>
      {open && (
        <div className='FeedbackModal__popout'>
          <div className='FeedbackModal__popoutHeader'>
            <p>SearchNEU Feedback</p>
          </div>
          <div className='FeedbackModal__popoutSubHeader'>
            <p>What info are you looking for?</p>
          </div>
        </div>
      ) }
      <div className='FeedbackModal__pill' role='button' tabIndex={ 0 } onClick={ () => { setOpen(!open) } }>
        <LogoInput height='14' width='18' fill='#d41b2c' />
        <p>SearchNEU Feedback</p>
      </div>
    </div>


  );
}
