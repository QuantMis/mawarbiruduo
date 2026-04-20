import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

const LINE_WIDTHS = ['w-full', 'w-[85%]', 'w-[70%]'] as const;

type SkeletonTextProps = HTMLAttributes<HTMLDivElement> & {
  lines?: number;
  'data-testid'?: string;
};

function SkeletonText({
  lines = 3,
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuatkan..."
      className={cn('space-y-3', className)}
      {...props}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            LINE_WIDTHS[i % LINE_WIDTHS.length],
            'motion-reduce:animate-none',
          )}
        />
      ))}
    </div>
  );
}

SkeletonText.displayName = 'SkeletonText';

export { SkeletonText };
export type { SkeletonTextProps };
