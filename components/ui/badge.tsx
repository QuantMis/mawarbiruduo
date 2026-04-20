import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center',
    'rounded-badge px-2.5 py-0.5',
    'text-xs font-medium',
    'transition-colors duration-150',
    'motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: {
        default: 'bg-navy text-cream',
        success: 'bg-green-600 text-white',
        warning: 'bg-amber-500 text-navy',
        error: 'bg-red-600 text-white',
        custom: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    'data-testid'?: string;
  };

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, style, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        style={style}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export type { BadgeProps };
