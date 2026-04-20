import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  'data-testid'?: string;
};

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-sm font-medium text-navy', className)}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-0.5 text-terracotta" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);

Label.displayName = 'Label';

export { Label };
export type { LabelProps };
