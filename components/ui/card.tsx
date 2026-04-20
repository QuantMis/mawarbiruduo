import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/* ─── Card Root ─── */

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hoverLift?: boolean;
  'data-testid'?: string;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverLift = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-card bg-cream shadow-card',
          'transition-shadow duration-150',
          'motion-reduce:transition-none',
          hoverLift && 'hover:shadow-elevated',
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';

/* ─── Card Header ─── */

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
};

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 pt-6 pb-0', className)}
        {...props}
      />
    );
  },
);

CardHeader.displayName = 'CardHeader';

/* ─── Card Body ─── */

type CardBodyProps = HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
};

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
    );
  },
);

CardBody.displayName = 'CardBody';

/* ─── Card Footer ─── */

type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
};

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-6 pt-0 pb-6', className)}
        {...props}
      />
    );
  },
);

CardFooter.displayName = 'CardFooter';

/* ─── Compound export ─── */

const CardNamespace = Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export { CardNamespace as Card, CardHeader, CardBody, CardFooter };
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
