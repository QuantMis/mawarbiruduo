import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveCols {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}

type GridProps = HTMLAttributes<HTMLDivElement> & {
  cols?: ResponsiveCols;
  gap?: string;
  'data-testid'?: string;
};

const colClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const mdColClasses: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

const lgColClasses: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      cols = { mobile: 1, tablet: 2, desktop: 3 },
      gap = 'gap-6',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const mobileCol = cols.mobile ? colClasses[cols.mobile] : '';
    const tabletCol = cols.tablet ? mdColClasses[cols.tablet] : '';
    const desktopCol = cols.desktop ? lgColClasses[cols.desktop] : '';

    return (
      <div
        ref={ref}
        className={cn('grid', mobileCol, tabletCol, desktopCol, gap, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Grid.displayName = 'Grid';

export { Grid };
export type { GridProps, ResponsiveCols };
