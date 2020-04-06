import React, { useState, useEffect } from 'react';
import { FilterSelection } from './filters';
import { SearchItem } from '../types';
import macros from '../macros';


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

  // When feedback finished (yes or query entered), set seen in local storage to automatically close header and start timing for showing once a day
  useEffect(() => {
    if (yes) {
      setTimeout(() => { localStorage.setItem('SEEN', 'true') }, 3000);
    }
  }, [yes]);

  if (localStorage.getItem('SEEN')) {
    if (!localStorage.getItem('SEEN_TODAY')) {
      const today = new Date();
      localStorage.setItem('SEEN_TODAY', today.toString());
    } else {
      const current = new Date();
      if (current.getTime() >= Date.parse(localStorage.getItem('SEEN_TODAY')) + 86400000) {
        localStorage.removeItem('SEEN_TODAY');
        localStorage.removeItem('SEEN');
        setYes(false);
        setNo(false);
        setClose(false);
      }
    }
  }

  return (
    !close && !localStorage.getItem('SEEN_TODAY') && (
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
