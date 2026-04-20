import type { Metadata } from 'next';
import { Section, SectionTitle } from '@/components/ui';
import { TemujanjiForm } from '@/components/client/temujanji-form';

export const metadata: Metadata = {
  title: 'Temujanji',
};

export default function TemujanjiPage() {
  return (
    <Section bg="cream" data-testid="temujanji-section">
      <SectionTitle title="Buat Temujanji" level={1} />
      <div className="mx-auto mt-8 max-w-2xl">
        <TemujanjiForm />
      </div>
    </Section>
  );
}
