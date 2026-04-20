'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  whatsAppMessage?: string;
  className?: string;
  'data-testid'?: string;
}

function EmptyState({
  title,
  description,
  icon,
  action,
  whatsAppMessage,
  className,
  ...props
}: EmptyStateProps) {
  const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsAppHref =
    whatsAppNumber && whatsAppMessage
      ? `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppMessage)}`
      : undefined;

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className,
      )}
      data-testid={props['data-testid']}
    >
      {icon && (
        <div className="mb-4 text-navy/30" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold text-navy/70 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-navy/50 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center justify-center',
            'h-10 px-4 text-sm font-medium',
            'rounded-button',
            'bg-navy text-cream hover:bg-navy-light active:bg-navy-dark',
            'transition-colors duration-150 motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-dusty-rose',
          )}
        >
          {action.label}
        </button>
      )}
      {whatsAppHref && (
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hubungi kami melalui WhatsApp"
          className={cn(
            'inline-flex items-center justify-center',
            'h-10 px-4 text-sm font-medium',
            'rounded-button',
            'border border-navy/30 text-navy/70 bg-transparent',
            'hover:bg-navy/5 active:bg-navy/10',
            'transition-colors duration-150 motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-dusty-rose',
            action ? 'mt-3' : '',
          )}
        >
          Hubungi via WhatsApp
        </a>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps, EmptyStateAction };
