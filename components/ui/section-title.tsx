import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Heading, type HeadingLevel } from './heading';
import { Text } from './text';

type SectionTitleProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
  level?: HeadingLevel;
  'data-testid'?: string;
};

const SectionTitle = forwardRef<HTMLDivElement, SectionTitleProps>(
  (
    { title, subtitle, level = 2, className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn('text-center', className)}
        {...props}
      >
        <Heading level={level}>{title}</Heading>
        {subtitle && (
          <Text variant="lead" className="mt-2 text-dark/70">
            {subtitle}
          </Text>
        )}
        <div
          className="mx-auto mt-4 h-[2px] w-12 bg-dusty-rose"
          aria-hidden="true"
        />
        {children}
      </div>
    );
  },
);

SectionTitle.displayName = 'SectionTitle';

export { SectionTitle };
export type { SectionTitleProps };
