import React, { useState } from 'react';
import { FilterSelection } from './filters';
import { SearchItem } from '../types';
import macros from '../macros';
import useFeedbackSchedule from './useFeedbackSchedule';


interface FeedbackHeaderProps {
  searchQuery: string;
  selectedFilters: FilterSelection;
  searchResults: SearchItem[];
}

export default function FeedbackHeader({ searchQuery, selectedFilters, searchResults }: FeedbackHeaderProps) {
  const [close, setClose] = useState(false);
  const [yes, setYes] = useState(false);
  const [no, setNo] = useState(false);
  const [feedbackQuery, setFeedbackQuery] = useState('');
  const keyString = 'FEEDBACK';
  const [show, setFinished] = useFeedbackSchedule(keyString, 86400000);


  return (
    show && !close && (
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
                    macros.logAmplitudeEvent('Feedback header click', {
                      isYes: true, searchQuery: searchQuery, selectedFilters: selectedFilters, searchResults: searchResults.slice(0, 3),
                    });
                    setFinished();
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
                    macros.logAmplitudeEvent('Feedback header click', {
                      isYes: false, searchQuery: searchQuery, selectedFilters: selectedFilters, searchResults: searchResults.slice(0, 3),
                    });
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
              <div className='FeedbackHeader__inputWrapper'>
                <input
                  className='FeedbackHeader__input'
                  autoComplete='off'
                // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={ !macros.isMobile }
                  placeholder={ !macros.isMobile ? 'Please enter feedback' : undefined }
                  value={ feedbackQuery }
                  onChange={ (event) => { setFeedbackQuery(event.target.value); } }
                  onKeyDown={ (event) => {
                    if (event.key === 'Enter') {
                      setYes(true);
                      setNo(false);
                      setFinished();
                      macros.logAmplitudeEvent('Feedback header user enter input', {
                        feedbackQuery: feedbackQuery, searchQuery: searchQuery, selectedFilters: selectedFilters, searchResults: searchResults.slice(0, 3),
                      })
                    }
                  } }
                />
              </div>
            </>
          )}
          <div className='FeedbackHeader__close' onClick={ () => { setClose(true); localStorage.setItem('SEEN', 'true'); } } role='button' aria-label='close' tabIndex={ 0 } />
        </div>
        <div className='FeedbackHeader__padding' />
      </>
    )

  );
}
