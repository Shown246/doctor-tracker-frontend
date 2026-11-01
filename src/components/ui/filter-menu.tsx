'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function FilterMenu({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOutside = (event: Event) => {
      const menu = ref.current;
      if (
        menu?.open &&
        event.target instanceof Node &&
        !menu.contains(event.target)
      ) {
        menu.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      const menu = ref.current;
      if (event.key === 'Escape' && menu?.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOutside, true);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside, true);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <details ref={ref} name="list-filters" className="filter-menu">
      <summary>{label}</summary>
      {children}
    </details>
  );
}
