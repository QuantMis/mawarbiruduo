import { Section } from '@/components/ui/section';
import { Skeleton } from '@/components/ui/skeleton';

export default function TemujanjiLoading() {
  return (
    <Section bg="cream" data-testid="temujanji-loading">
      {/* SectionTitle skeleton */}
      <div className="text-center">
        <Skeleton
          variant="text"
          className="mx-auto h-8 w-48 motion-reduce:animate-none"
        />
        <Skeleton
          variant="rect"
          className="mx-auto mt-4 h-[2px] w-12 motion-reduce:animate-none"
        />
      </div>

      {/* Form skeleton */}
      <div
        className="mx-auto mt-8 max-w-2xl space-y-6"
        role="status"
        aria-busy="true"
        aria-label="Memuatkan..."
      >
        {/* Input fields */}
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton
              variant="text"
              className="h-4 w-24 motion-reduce:animate-none"
            />
            <Skeleton
              variant="rect"
              className="h-10 w-full motion-reduce:animate-none"
            />
          </div>
        ))}

        {/* Textarea field */}
        <div className="space-y-2">
          <Skeleton
            variant="text"
            className="h-4 w-20 motion-reduce:animate-none"
          />
          <Skeleton
            variant="rect"
            className="h-24 w-full motion-reduce:animate-none"
          />
        </div>

        {/* Submit button */}
        <Skeleton
          variant="rect"
          className="h-10 w-full motion-reduce:animate-none"
        />
      </div>
    </Section>
  );
}
