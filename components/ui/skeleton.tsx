import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva('animate-pulse bg-navy/10', {
  variants: {
    variant: {
      text: 'h-4 w-full rounded',
      circle: 'rounded-full',
      rect: 'rounded-card',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

type SkeletonProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants> & {
    'data-testid'?: string;
  };

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants };
export type { SkeletonProps };
