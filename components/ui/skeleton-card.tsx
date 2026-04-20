import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { SkeletonText } from './skeleton-text';

type SkeletonCardProps = HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
};

function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuatkan..."
      className={cn(
        'rounded-card bg-cream shadow-card overflow-hidden',
        'motion-reduce:animate-none',
        className,
      )}
      {...props}
    >
      {/* Image area */}
      <Skeleton
        variant="rect"
        className="h-48 w-full rounded-none motion-reduce:animate-none"
      />

      {/* Content area */}
      <div className="px-6 py-4 space-y-3">
        {/* Title line */}
        <Skeleton
          variant="text"
          className="h-5 w-3/4 motion-reduce:animate-none"
        />
        {/* Body lines */}
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

SkeletonCard.displayName = 'SkeletonCard';

export { SkeletonCard };
export type { SkeletonCardProps };
