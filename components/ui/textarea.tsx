'use client';

import {
  forwardRef,
  useId,
  useCallback,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  'data-testid'?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      autoResize = false,
      id,
      required,
      onInput,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy =
      [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const handleInput = useCallback(
      (e: React.FormEvent<HTMLTextAreaElement>) => {
        if (autoResize) {
          const target = e.currentTarget;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }
        onInput?.(e as unknown as React.InputEvent<HTMLTextAreaElement>);
      },
      [autoResize, onInput],
    );

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onInput={handleInput}
          className={cn(
            'min-h-[5rem] rounded-button border bg-cream px-3 py-2 text-base text-navy',
            'transition-colors duration-150',
            'motion-reduce:transition-none',
            'placeholder:text-navy/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            autoResize && 'resize-none overflow-hidden',
            error
              ? 'border-red-600 focus-visible:ring-red-600'
              : 'border-navy',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-navy/60">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
