import { Section } from '@/components/ui/section';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonCalendar } from '@/components/ui/skeleton-calendar';

export default function KalendarLoading() {
  return (
    <Section bg="cream" data-testid="kalendar-loading">
      {/* SectionTitle skeleton */}
      <div className="text-center">
        <Skeleton
          variant="text"
          className="mx-auto h-8 w-56 motion-reduce:animate-none"
        />
        <Skeleton
          variant="rect"
          className="mx-auto mt-4 h-[2px] w-12 motion-reduce:animate-none"
        />
      </div>

      {/* Calendar skeleton */}
      <div className="mx-auto mt-8 max-w-4xl">
        <SkeletonCalendar />
      </div>
    </Section>
  );
}
