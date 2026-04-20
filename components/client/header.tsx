'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { NavLink } from '@/components/ui/nav-link';
import { MobileMenu } from '@/components/ui/mobile-menu';
import type { MobileMenuLink } from '@/components/ui/mobile-menu';
import { cn } from '@/lib/utils';

const NAV_LINKS: ReadonlyArray<MobileMenuLink> = [
  { href: '/', label: 'Utama' },
  { href: '/pakej', label: 'Pakej' },
  { href: '/temujanji', label: 'Temujanji' },
  { href: '/kalendar', label: 'Kalendar' },
] as const;

function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasScrolled(!entry.isIntersecting);
      },
      { threshold: 1.0 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Sentinel for IntersectionObserver scroll detection */}
      <div ref={sentinelRef} className="absolute top-0 left-0 h-px w-full" aria-hidden="true" />

      <header
        role="banner"
        className={cn(
          'sticky top-0 z-30 bg-navy',
          'h-16 lg:h-18',
          'transition-shadow duration-200 motion-reduce:transition-none',
          hasScrolled && 'shadow-md',
        )}
      >
        {/* Skip-to-content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cream focus:text-navy focus:rounded"
        >
          Langkau ke kandungan utama
        </a>

        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              'font-serif text-xl text-cream md:text-2xl',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose focus-visible:ring-offset-2 focus-visible:ring-offset-navy',
              'rounded-sm',
            )}
          >
            MawarBiru
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Navigasi utama" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href}>{link.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile/tablet navigation */}
          <div className="lg:hidden">
            <MobileMenu links={[...NAV_LINKS]} />
          </div>
        </div>
      </header>
    </>
  );
}

Header.displayName = 'Header';

export { Header };
