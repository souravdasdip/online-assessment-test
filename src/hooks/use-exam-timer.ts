'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useExamTimer(initialMinutes: number, onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep the ref current without causing effect re-runs
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (initialMinutes <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialMinutes]);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [timeLeft]);

  return { timeLeft, formatTime };
}
