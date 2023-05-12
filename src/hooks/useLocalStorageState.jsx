import { useCallback, useEffect, useState } from 'react';

function setStorage(key, value) {
  if (window?.localStorage) {
    if (value === undefined) {
      window.localStorage.removeItem(key);
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    const fromStorage = localStorage.getItem(key);

    if (fromStorage !== null) {
      return JSON.parse(fromStorage);
    }

    let defaultValue = initialValue;
    if (typeof initialValue === 'function') {
      defaultValue = initialValue();
    }

    setStorage(key, defaultValue);
    return defaultValue;
  });

  useEffect(() => {
    function handleStorage(e) {
      if (e.key === key) {
        setState(JSON.parse(e.newValue));
      }
    }

    window?.addEventListener('storage', handleStorage);
    return () => {
      window?.removeEventListener('storage', handleStorage);
    };
  }, [key]);

  const updateState = useCallback(
    (newState) => {
      setState((oldState) => {
        let newValue = newState;
        if (typeof newState === 'function') {
          newValue = newState(oldState);
        }
        setStorage(key, newValue);
        return newValue;
      });
    },
    [key]
  );

  return [state, updateState];
}
