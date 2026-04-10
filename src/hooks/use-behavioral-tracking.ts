'use client';

import { useEffect } from 'react';

type ViolationType = 'TAB_SWITCH' | 'FULLSCREEN_EXIT';

export function useBehavioralTracking(
  onViolation: (type: ViolationType) => void
) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onViolation('TAB_SWITCH');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onViolation('FULLSCREEN_EXIT');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onViolation]);
}
