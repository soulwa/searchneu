import React, { useState, useRef } from 'react';
import LogoInput from '../../images/LogoInput';
import FeedbackModalInitial from './FeedbackModalInitial';
import FeedbackModalCheckboxes from './FeedbackModalCheckboxes';
import FeedbackModalFree from './FeedbackModalFree';
import macros from '../../macros';
import useFeedbackSchedule from '../useFeedbackSchedule';
import useClickOutside from '../useClickOutside';


export default function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [yes, setYes] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [feedbackQuery, setFeedbackQuery] = useState('');
  const [feedbackType, setFeedbackType] = useState('filter');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState('initial');

  const modalRef = useRef(null);
  useClickOutside(modalRef, open, setOpen);

  const keyString = 'MODAL'
  const [show, setFinished] = useFeedbackSchedule(keyString, 86400000);

  const feedbackOptions = ['Class time', 'Professor', 'Prereqs', 'Something else'];

  function handleSubmit() {
    switch (step) {
      case 'initial':
        if (yes) {
          macros.logAmplitudeEvent('Feedback modal initial submit', { lookingForFound: yes });
          setSubmitted(true);
          setFinished();
        } else {
          macros.logAmplitudeEvent('Feedback modal initial submit', { lookingForFound: yes });
          setStep('checkbox');
        }
        break;
      case 'checkbox':
        macros.logAmplitudeEvent('Feedback modal checkbox submit', { lookingFor: selectedFeedback });
        setStep('free');
        break;
      case 'free':
        macros.logAmplitudeEvent('Feedback modal free submit', { feedbackType: feedbackType, feedbackQuery: feedbackQuery });
        setSubmitted(true);
        setFinished();
        break;
      default:
        break;
    }
  }

  function buttonText() {
    if (yes && submitted) {
      return 'HOLLA HOLLA';
    } if (submitted) {
      return 'THANK YOU!';
    }
    return 'SEND FEEDBACK'
  }

  function renderFeedback() {
    switch (step) {
      case 'initial':
        return <FeedbackModalInitial setYes={ setYes } />;
      case 'checkbox':
        return <FeedbackModalCheckboxes feedbackOptions={ feedbackOptions } selectedFeedback={ selectedFeedback } setSelectedFeedback={ setSelectedFeedback } />;
      case 'free':
        return <FeedbackModalFree feedbackQuery={ feedbackQuery } setFeedbackQuery={ setFeedbackQuery } setFeedbackType={ setFeedbackType } />;
      default:
        return null;
    }
  }

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
          <p>{buttonText()}</p>
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
