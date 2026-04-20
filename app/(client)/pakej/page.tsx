import type { Metadata } from 'next';
import {
  Section,
  SectionTitle,
  Card,
  CardHeader,
  CardBody,
  Grid,
  Heading,
  Text,
  Badge,
} from '@/components/ui';
import { senaraiPakej, type PakejTier, type PakejSection } from '@/lib/data/pakej';

export const metadata: Metadata = {
  title: 'Pakej',
};

const formatHarga = new Intl.NumberFormat('ms-MY', {
  style: 'currency',
  currency: 'MYR',
  minimumFractionDigits: 0,
});

function formatTierPrice(tier: Readonly<PakejTier>): string {
  const price = formatHarga.format(tier.harga);

  if (tier.perPax) {
    return `${price}/pax`;
  }

  return price;
}

function TierCard({
  tier,
  warna,
  delay,
}: Readonly<{
  tier: Readonly<PakejTier>;
  warna: string;
  delay: number;
}>) {
  return (
    <div
      className="motion-safe:animate-fade-in rounded-lg border border-dark/10 bg-white p-5 text-center"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <Text variant="small" className="font-semibold uppercase tracking-wide">
        {tier.nama}
      </Text>
      {tier.bilanganPax > 0 && (
        <Badge
          variant="custom"
          className="mt-2 text-white"
          style={{ backgroundColor: warna }}
        >
          {tier.bilanganPax} PAX
        </Badge>
      )}
      <p
        className="mt-3 text-2xl font-bold md:text-3xl"
        style={{ color: warna }}
      >
        {formatTierPrice(tier)}
      </p>
    </div>
  );
}

function PakejSectionList({
  section,
}: Readonly<{
  section: Readonly<PakejSection>;
}>) {
  return (
    <div>
      <Heading level={4} className="mb-3">
        {section.tajuk}
      </Heading>
      <ul className="list-disc space-y-1 pl-5">
        {section.items.map((item) => (
          <li key={item}>
            <Text as="span" variant="small">
              {item}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PakejPage() {
  return (
    <Section bg="cream" data-testid="pakej-page">
      <SectionTitle title="Pakej Kami" level={1} />

      <div className="mt-12 space-y-16">
        {senaraiPakej.map((pakej, pakejIndex) => (
          <article
            key={pakej.nama}
            className="motion-safe:animate-fade-in"
            style={{
              animationDelay: `${pakejIndex * 200}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <Card>
              <CardHeader>
                <div
                  className="border-l-4 pl-4"
                  style={{ borderColor: pakej.warna }}
                >
                  <Heading level={2} style={{ color: pakej.warna }}>
                    {pakej.nama}
                  </Heading>
                  <Text variant="muted" className="mt-1">
                    {pakej.penerangan}
                  </Text>
                </div>
              </CardHeader>

              <CardBody className="space-y-8">
                {/* Tier pricing grid */}
                <Grid
                  cols={{ mobile: 1, tablet: 2, desktop: 3 }}
                  gap="gap-4"
                >
                  {pakej.tiers.map((tier, tierIndex) => (
                    <TierCard
                      key={tier.nama}
                      tier={tier}
                      warna={pakej.warna}
                      delay={pakejIndex * 200 + (tierIndex + 1) * 100}
                    />
                  ))}
                </Grid>

                {/* Divider */}
                <hr className="border-dark/10" />

                {/* Menu & inclusions sections */}
                <Grid
                  cols={{ mobile: 1, tablet: 2, desktop: 2 }}
                  gap="gap-8"
                >
                  {pakej.sections.map((section) => (
                    <PakejSectionList
                      key={section.tajuk}
                      section={section}
                    />
                  ))}
                </Grid>
              </CardBody>
            </Card>

            {/* Divider between packages (not after last) */}
            {pakejIndex < senaraiPakej.length - 1 && (
              <div className="mx-auto mt-16 h-px w-1/3 bg-dark/10" />
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
