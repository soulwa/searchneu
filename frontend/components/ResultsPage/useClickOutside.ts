import { useEffect } from 'react';

// Hook for closing components when clicked outside
export default function useClickOutside(ref: React.RefObject<HTMLElement>, flag: boolean, setFlag: (b: boolean) => void) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current.contains(e.target)) {
        return;
      }
      setFlag(false);
    }

    if (flag) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [flag, ref, setFlag]);
}
