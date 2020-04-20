import { useState, useEffect } from 'react';

export default function useFeedbackSchedule(keyString: string, timeout: number) : [boolean, () => void] {
  const [show, setShow] = useState(true);

  const setFinished = () => {
    setTimeout(() => { localStorage.setItem(keyString, 'true') }, 2000);
  }


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (localStorage.getItem(keyString)) {
      if (!localStorage.getItem(`SEEN_${keyString}`)) {
        const today = new Date();
        localStorage.setItem(`SEEN_${keyString}`, today.toString());
      } else {
        const current = new Date();
        if (current.getTime() >= Date.parse(localStorage.getItem(`SEEN_${keyString}`)) + timeout) {
          localStorage.removeItem(`SEEN_${keyString}`);
          localStorage.removeItem(keyString);
        }
      }
    }
    if (localStorage.getItem(keyString)) {
      setShow(false);
    }
  });


  return [show, setFinished];
}
