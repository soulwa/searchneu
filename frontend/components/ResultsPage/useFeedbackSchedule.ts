import { useState, useEffect } from 'react';

export default function useFeedbackSchedule(finished: boolean, keyStr: string, timeout: number) : boolean {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (finished) {
      setTimeout(() => { localStorage.setItem(keyStr, 'true') }, 2000);
    }
  }, [finished, keyStr]);

  useEffect(() => {
    if (localStorage.getItem(keyStr)) {
      if (!localStorage.getItem(`SEEN_${keyStr}`)) {
        const today = new Date();
        localStorage.setItem(`SEEN_${keyStr}`, today.toString());
      } else {
        const current = new Date();
        if (current.getTime() >= Date.parse(localStorage.getItem(`SEEN_${keyStr}`)) + timeout) {
          localStorage.removeItem(`SEEN_${keyStr}`);
          localStorage.removeItem(keyStr);
        }
      }
    }
    if (localStorage.getItem(keyStr)) {
      setShow(false);
    }
  }, [keyStr, timeout]);


  return show;
}
