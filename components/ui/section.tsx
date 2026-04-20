import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Container } from './container';

type SectionBg = 'cream' | 'navy' | 'white';

const bgStyles: Record<SectionBg, string> = {
  cream: 'bg-cream',
  navy: 'bg-navy text-cream',
  white: 'bg-white',
};

type SectionProps = HTMLAttributes<HTMLElement> & {
  bg?: SectionBg;
  'data-testid'?: string;
};

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ bg, className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'py-16 lg:py-24',
          bg && bgStyles[bg],
          className,
        )}
        {...props}
      >
        <Container>{children}</Container>
      </section>
    );
  },
);

Section.displayName = 'Section';

export { Section, bgStyles };
export type { SectionProps, SectionBg };
