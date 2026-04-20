import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

const DAY_LABELS = ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'] as const;
const ROWS = 5;

type SkeletonCalendarProps = HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
};

function SkeletonCalendar({
  className,
  ...props
}: SkeletonCalendarProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuatkan..."
      className={cn('w-full', className)}
      {...props}
    >
      {/* Month header */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton
          variant="text"
          className="h-6 w-32 motion-reduce:animate-none"
        />
        <div className="flex gap-2">
          <Skeleton
            variant="rect"
            className="h-8 w-8 motion-reduce:animate-none"
          />
          <Skeleton
            variant="rect"
            className="h-8 w-8 motion-reduce:animate-none"
          />
        </div>
      </div>

      {/* Day labels header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-dark/40 py-2"
            aria-hidden="true"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: ROWS * 7 }, (_, i) => (
          <Skeleton
            key={i}
            variant="rect"
            className="aspect-square w-full motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}

SkeletonCalendar.displayName = 'SkeletonCalendar';

export { SkeletonCalendar };
export type { SkeletonCalendarProps };
