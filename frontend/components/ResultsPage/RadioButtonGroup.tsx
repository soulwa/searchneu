import React from 'react';

interface IRadioButtonProps {
  disabled?: boolean
  value: string
}
interface IRadioButtonGroupProps {
  children: (RadioButton: React.FC<IRadioButtonProps>) => JSX.Element
  name: string
  value: string
  onChange: (newValue: string) => any
}

const RadioButtonGroup: React.FC<IRadioButtonGroupProps> = (props) => {
  const {
    children, name, value: selectedValue, onChange,
  } = props

  const onRadioButtonChange = (
    radioButtonValue: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.checked) {
      onChange(selectedValue.concat(radioButtonValue))
    } else {
      onChange(selectedValue)
    }
  }

  const RadioButton: React.FC<IRadioButtonProps> = (radioButtonProps) => {
    const { value: cbValue, disabled, ...rest } = radioButtonProps

    const selected = (selectedValue != null) || false;

    return (
      <input
        // eslint-disable-next-line react/jsx-props-no-spreading
        { ...rest }
        type='radio button'
        name={ name }
        disabled={ disabled }
        checked={ selected }
        onChange={ onRadioButtonChange.bind(null, cbValue) }
        value={ cbValue }
      />
    )
  }

  return children(RadioButton)
}

export default RadioButtonGroup
