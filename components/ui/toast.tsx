'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';
import { useEffect, useState } from 'react';

type ToasterPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

function useResponsivePosition(): ToasterPosition {
  const [position, setPosition] = useState<ToasterPosition>('bottom-right');

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)');

    function update(e: MediaQueryList | MediaQueryListEvent) {
      setPosition(e.matches ? 'bottom-right' : 'bottom-center');
    }

    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return position;
}

function Toaster() {
  const position = useResponsivePosition();

  return (
    <SonnerToaster
      position={position}
      toastOptions={{
        style: {
          backgroundColor: 'var(--color-cream)',
          color: 'var(--color-navy)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--color-cream-dark)',
          fontFamily: 'var(--font-sans)',
        },
      }}
    />
  );
}

export { Toaster, toast };
