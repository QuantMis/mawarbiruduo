import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const levelStyles = {
  1: 'text-3xl md:text-4xl lg:text-5xl',
  2: 'text-2xl md:text-3xl lg:text-4xl',
  3: 'text-xl md:text-2xl lg:text-3xl',
  4: 'text-lg md:text-xl',
  5: 'text-base md:text-lg',
  6: 'text-sm md:text-base',
} as const;

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel;
  'data-testid'?: string;
};

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, className, children, ...props }, ref) => {
    const Tag = `h${level}` as const;

    return (
      <Tag
        ref={ref}
        className={cn(
          'font-serif font-bold text-navy',
          levelStyles[level],
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

Heading.displayName = 'Heading';

export { Heading, levelStyles };
export type { HeadingProps, HeadingLevel };
