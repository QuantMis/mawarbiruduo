import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextElement = 'p' | 'span' | 'div' | 'small';

type TextVariant = 'body' | 'lead' | 'small' | 'muted';

const variantStyles: Record<TextVariant, string> = {
  body: 'text-base',
  lead: 'text-lg',
  small: 'text-sm',
  muted: 'text-sm text-dark/60',
};

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement;
  variant?: TextVariant;
  'data-testid'?: string;
};

const Text = forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = 'p', variant = 'body', className, children, ...props }, ref) => {
    return (
      <Tag
        ref={ref as React.Ref<never>}
        className={cn('text-dark', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

Text.displayName = 'Text';

export { Text, variantStyles };
export type { TextProps, TextElement, TextVariant };
