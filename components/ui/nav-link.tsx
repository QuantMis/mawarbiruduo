'use client';

import { forwardRef, type AnchorHTMLAttributes } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, children, className, onClick, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
      <Link
        ref={ref}
        href={href}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'text-cream font-sans text-base transition-colors duration-150',
          'motion-reduce:transition-none',
          'hover:underline hover:decoration-dusty-rose hover:underline-offset-4 hover:decoration-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose focus-visible:ring-offset-2 focus-visible:ring-offset-navy',
          'rounded-sm',
          isActive &&
            'underline decoration-terracotta underline-offset-4 decoration-2',
          className,
        )}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

NavLink.displayName = 'NavLink';

export { NavLink };
export type { NavLinkProps };
