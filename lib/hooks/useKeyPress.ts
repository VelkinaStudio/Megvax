import { useEffect, useState } from 'react';

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}

export function useHotkey(
  key: string,
  callback: () => void,
  options: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrlMatch = options.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
      const shiftMatch = options.shiftKey ? e.shiftKey : !e.shiftKey;
      const altMatch = options.altKey ? e.altKey : !e.altKey;

      if (e.key === key && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options]);
}
