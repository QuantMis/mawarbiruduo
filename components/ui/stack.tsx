import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type StackDirection = 'col' | 'row';

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: StackDirection;
  gap?: string;
  align?: string;
  justify?: string;
  'data-testid'?: string;
};

const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'col',
      gap = 'gap-4',
      align,
      justify,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'col' ? 'flex-col' : 'flex-row',
          gap,
          align,
          justify,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Stack.displayName = 'Stack';

export { Stack };
export type { StackProps, StackDirection };
