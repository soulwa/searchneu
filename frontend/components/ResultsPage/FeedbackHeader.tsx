import React, { useState } from 'react';
import macros from '../macros';

export default function FeedbackHeader() {
  const [close, setClose] = useState(false);
  const [yes, setYes] = useState(false);
  const [no, setNo] = useState(false);
  const [feedbackQuery, setFeedbackQuery] = useState('');

  return (
    !close && (
      <>
        <div className='FeedbackHeader'>
          { !yes && !no
            && (
              <>
                <label className='FeedbackHeader__q1'>
                  Did you find what you&apos;re looking for?
                </label>
                <div
                  className='FeedbackHeader__yes'
                  role='button'
                  tabIndex={ 0 }
                  onClick={ () => {
                    setYes(true);
                    macros.logAmplitudeEvent('Feedback header click yes', { message: 'user found what they were looking for' });
                  } }
                >
                  {macros.isMobile ? 'Y' : 'Yes'}
                </div>
                <div
                  className='FeedbackHeader__no'
                  role='button'
                  tabIndex={ 0 }
                  onClick={ () => {
                    setNo(true);
                    macros.logAmplitudeEvent('Feedback header click no', { message: 'user did not find what they were looking for' });
                  } }
                >
                  {macros.isMobile ? 'N' : 'No'}
                </div>
              </>
            )}
          {yes && <div className='FeedbackHeader__thanks'>Thank you for helping make SearchNEU better!</div> }
          {no && (
            <>
              <div className='FeedbackHeader__q2'>What were you looking for?</div>
              <input
                className='FeedbackHeader__input'
                autoComplete='off'
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={ !macros.isMobile }
                placeholder={ !macros.isMobile ? 'Enter your original query' : undefined }
                value={ feedbackQuery }
                onChange={ (event) => { setFeedbackQuery(event.target.value); } }
                onKeyDown={ (event) => {
                  if (event.key === 'Enter') {
                    setYes(true);
                    setNo(false);
                    console.log('feedbackQuery', feedbackQuery);
                    macros.logAmplitudeEvent('Feedback header user enter input', { message: feedbackQuery })
                  }
                } }
              />
            </>
          )}
          <div className='FeedbackHeader__close' onClick={ () => setClose(true) } role='button' aria-label='close' tabIndex={ 0 } />
        </div>
        <div className='FeedbackHeader__padding' />
      </>
    )

  );
}
