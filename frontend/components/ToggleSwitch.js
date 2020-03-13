import React from 'react';
import './ToggleSwitch.scss';

const ToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <>
      <input
        checked={ isOn }
        onChange={ handleToggle }
        className='react-switch-checkbox'
        id='react-switch-new'
        type='checkbox'
      />
      <label
        style={{ background: isOn && '#d41b2c' }}
        className='react-switch-label'
        htmlFor='react-switch-new'
      >
        <span className='react-switch-button' />
      </label>
    </>
  );
};

export default ToggleSwitch;
