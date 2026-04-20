import type { Metadata } from 'next';
import { Section, SectionTitle } from '@/components/ui';
import { Kalendar } from '@/components/client/kalendar';

export const metadata: Metadata = {
  title: 'Kalendar',
};

export default function KalendarPage() {
  return (
    <Section bg="cream" data-testid="kalendar-section">
      <SectionTitle title="Kalendar Tempahan" level={2} />
      <div className="mx-auto mt-8 max-w-4xl">
        <Kalendar />
      </div>
    </Section>
  );
}
