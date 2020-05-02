import React from 'react';

interface InitialStepProps {
  setYes: (b:boolean) => void;
}

export default function FeedbackModalInitial({ setYes } : InitialStepProps) {
  return (
    <>
      <div className='FeedbackModal__popoutSubHeader'>
        <p>Did you find what you were looking for?</p>
      </div>
      <div className='FeedbackModal__initial'>
        <label className='FeedbackModal__initialText' onClick={ () => setYes(true) }>
          <input type='radio' name='FeedbackRadio' />
          <span className='FeedbackModal__initialRadio' />
          Yes
        </label>
        <label className='FeedbackModal__initialText' onClick={ () => setYes(false) }>
          <input type='radio' name='FeedbackRadio' />
          <span className='FeedbackModal__initialRadio' />
          No
        </label>
      </div>
    </>
  );
}
