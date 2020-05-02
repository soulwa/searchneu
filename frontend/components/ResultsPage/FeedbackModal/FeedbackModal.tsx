import React, { useState, useEffect, useRef } from 'react';
import LogoInput from '../../images/LogoInput';
import FeedbackModalInitial from './FeedbackModalInitial';
import FeedbackModalCheckboxes from './FeedbackModalCheckboxes';
import macros from '../../macros';
import useFeedbackSchedule from '../useFeedbackSchedule';


export default function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [yes, setYes] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState('initial');
  const modalRef = useRef(null);
  const keyString = 'MODAL'
  const [show, setFinished] = useFeedbackSchedule(keyString, 86400000);

  const feedbackOptions = ['Class time', 'Professor', 'Prereqs', 'Something else'];

  const handleClickOutside = (e) => {
    if (modalRef.current.contains(e.target)) {
      return;
    }
    setOpen(false);
  }
  console.log('yes', yes);

  const handleSubmit = () => {
    switch (step) {
      case 'initial':
        if (yes) {
          macros.logAmplitudeEvent('Feedback modal initial submit', { lookingForFound: yes });
        } else {
          macros.logAmplitudeEvent('Feedback modal initial submit', { lookingForFound: yes });
          setStep('checkbox');
        }
      case 'checkbox':
        macros.logAmplitudeEvent('Feedback modal checkbox submit', { lookingFor: selectedFeedback });
    }
  }


  const renderFeedback = () => {
    switch (step) {
      case 'initial':
        return <FeedbackModalInitial setYes={ setYes } />;
      case 'checkbox':
        return <FeedbackModalCheckboxes feedbackOptions={ feedbackOptions } selectedFeedback={ selectedFeedback } setSelectedFeedback={ setSelectedFeedback } />;
    }
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);


  return (
    show
    && (
    <div ref={ modalRef } className='FeedbackModal'>
      {open && (
      <div className='FeedbackModal__popout'>
        <div className='FeedbackModal__popoutHeader'>
          <p>SearchNEU Feedback</p>
        </div>
        { renderFeedback()}
        <div className={ !submitted ? 'FeedbackModal__submit' : 'FeedbackModal__submit--submitted' } role='button' tabIndex={ 0 } onClick={ handleSubmit }>
          <p>{!submitted ? 'SEND FEEDBACK' : 'THANK YOU!' }</p>
        </div>
      </div>
      ) }
      <div className='FeedbackModal__pill' role='button' tabIndex={ 0 } onClick={ () => { setOpen(!open) } }>
        <LogoInput height='14' width='18' fill='#d41b2c' />
        <p>SearchNEU Feedback</p>
      </div>
    </div>
    )
  );
}
