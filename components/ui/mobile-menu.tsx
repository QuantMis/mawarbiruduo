'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from './nav-link';
import { cn } from '@/lib/utils';

interface MobileMenuLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  links: MobileMenuLink[];
}

function MobileMenu({ links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    function handleTab(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={isOpen ? close : open}
        aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={isOpen}
        className={cn(
          'relative z-[var(--z-menu)] flex h-10 w-10 flex-col items-center justify-center gap-1.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose focus-visible:ring-offset-2',
          'rounded-sm',
        )}
      >
        <span
          className={cn(
            'block h-0.5 w-6 bg-cream transition-transform duration-200 motion-reduce:transition-none',
            isOpen && 'translate-y-2 rotate-45',
          )}
        />
        <span
          className={cn(
            'block h-0.5 w-6 bg-cream transition-opacity duration-200 motion-reduce:transition-none',
            isOpen && 'opacity-0',
          )}
        />
        <span
          className={cn(
            'block h-0.5 w-6 bg-cream transition-transform duration-200 motion-reduce:transition-none',
            isOpen && '-translate-y-2 -rotate-45',
          )}
        />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[var(--z-menu)] bg-navy/70 transition-opacity duration-200 motion-reduce:transition-none',
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={close}
      />

      {/* Slide-in drawer */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal={isOpen ? true : undefined}
        aria-label="Menu navigasi"
        className={cn(
          'fixed inset-y-0 right-0 z-[var(--z-menu)] w-72 bg-cream shadow-elevated',
          'transition-transform duration-200 motion-reduce:transition-none',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={close}
            aria-label="Tutup menu"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-sm text-navy',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose focus-visible:ring-offset-2',
            )}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-2 px-6 py-4">
          {links.map((link, index) => (
            <NavLink
              key={link.href}
              ref={index === 0 ? firstLinkRef : undefined}
              href={link.href}
              onClick={close}
              className="text-navy hover:text-terracotta py-3 text-lg"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

MobileMenu.displayName = 'MobileMenu';

export { MobileMenu };
export type { MobileMenuProps, MobileMenuLink };
