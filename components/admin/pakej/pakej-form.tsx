'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { createPakejSchema, type CreatePakejInput } from '@/lib/validations/pakej';

interface PakejFormInitialData {
  readonly id: string;
  readonly namaPakej: string;
  readonly warna: string;
  readonly tiers: ReadonlyArray<{
    readonly namaTier: string;
    readonly bilanganPax: number;
    readonly harga: number;
  }>;
  readonly sections: ReadonlyArray<{
    readonly tajuk: string;
    readonly items: readonly string[];
  }>;
}

interface PakejFormProps {
  readonly initialData?: PakejFormInitialData;
}

type FormValues = {
  namaPakej: string;
  warna: string;
  tiers: Array<{
    namaTier: string;
    bilanganPax: number;
    harga: number;
  }>;
  sections: Array<{
    tajuk: string;
    itemsText: string;
  }>;
};

function toFormValues(data?: PakejFormInitialData): FormValues {
  if (!data) {
    return {
      namaPakej: '',
      warna: '#000000',
      tiers: [{ namaTier: '', bilanganPax: 0, harga: 0 }],
      sections: [],
    };
  }

  return {
    namaPakej: data.namaPakej,
    warna: data.warna,
    tiers: data.tiers.map((t) => ({
      namaTier: t.namaTier,
      bilanganPax: t.bilanganPax,
      harga: t.harga,
    })),
    sections: data.sections.map((s) => ({
      tajuk: s.tajuk,
      itemsText: s.items.join('\n'),
    })),
  };
}

function toApiPayload(values: FormValues): CreatePakejInput {
  return {
    namaPakej: values.namaPakej,
    warna: values.warna,
    tiers: values.tiers,
    sections: values.sections.map((s) => ({
      tajuk: s.tajuk,
      items: s.itemsText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    })),
  };
}

export function PakejForm({ initialData }: PakejFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: toFormValues(initialData),
  });

  const {
    fields: tierFields,
    append: appendTier,
    remove: removeTier,
  } = useFieldArray({ control, name: 'tiers' });

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({ control, name: 'sections' });

  const warnaValue = watch('warna');

  async function onSubmit(values: FormValues) {
    const payload = toApiPayload(values);

    // Client-side validation with Zod
    const parsed = createPakejSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      toast.error(firstIssue?.message ?? 'Data tidak sah');
      return;
    }

    const url = isEditing
      ? `/api/admin/pakej/${initialData!.id}`
      : '/api/admin/pakej';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Gagal menyimpan pakej');
        return;
      }

      toast.success(
        isEditing ? 'Pakej berjaya dikemaskini' : 'Pakej berjaya ditambah',
      );
      router.push('/admin/pakej');
      router.refresh();
    } catch {
      toast.error('Ralat rangkaian');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card className="bg-white">
        <CardHeader>
          <h2 className="text-lg font-semibold text-navy">Maklumat Asas</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="namaPakej">Nama Pakej</Label>
            <Input
              id="namaPakej"
              {...register('namaPakej', { required: 'Nama pakej diperlukan' })}
              placeholder="cth: Night Wedding"
            />
            {errors.namaPakej && (
              <p className="mt-1 text-sm text-red-600">
                {errors.namaPakej.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="warna">Warna</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="warna-picker"
                {...register('warna')}
                className="h-10 w-14 cursor-pointer rounded border border-navy/20"
              />
              <Input
                id="warna"
                {...register('warna', {
                  required: 'Warna diperlukan',
                  pattern: {
                    value: /^#[0-9A-Fa-f]{6}$/,
                    message: 'Format hex tidak sah',
                  },
                })}
                placeholder="#000000"
                className="max-w-40 font-mono"
              />
              <span
                className="inline-block h-10 w-10 rounded border border-navy/20"
                style={{ backgroundColor: warnaValue }}
              />
            </div>
            {errors.warna && (
              <p className="mt-1 text-sm text-red-600">
                {errors.warna.message}
              </p>
            )}
          </div>

          <div>
            <Label>Gambar</Label>
            <p className="text-sm text-navy/60">
              Muat naik gambar akan ditambah kemudian.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Tiers */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Tier Harga</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                appendTier({ namaTier: '', bilanganPax: 0, harga: 0 })
              }
            >
              + Tambah Tier
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {tierFields.length === 0 && (
            <p className="text-sm text-navy/60">
              Sekurang-kurangnya 1 tier diperlukan.
            </p>
          )}
          {tierFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-wrap items-end gap-3 rounded border border-navy/10 p-3"
            >
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor={`tiers.${index}.namaTier`}>Nama Tier</Label>
                <Input
                  id={`tiers.${index}.namaTier`}
                  {...register(`tiers.${index}.namaTier`, {
                    required: 'Nama tier diperlukan',
                  })}
                  placeholder="cth: 300 PAX"
                />
                {errors.tiers?.[index]?.namaTier && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tiers[index].namaTier?.message}
                  </p>
                )}
              </div>
              <div className="w-32">
                <Label htmlFor={`tiers.${index}.bilanganPax`}>
                  Bilangan Pax
                </Label>
                <Input
                  id={`tiers.${index}.bilanganPax`}
                  type="number"
                  {...register(`tiers.${index}.bilanganPax`, {
                    valueAsNumber: true,
                    required: 'Bilangan pax diperlukan',
                    min: { value: 0, message: 'Mestilah 0 atau lebih' },
                  })}
                  placeholder="0"
                />
                {errors.tiers?.[index]?.bilanganPax && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tiers[index].bilanganPax?.message}
                  </p>
                )}
              </div>
              <div className="w-40">
                <Label htmlFor={`tiers.${index}.harga`}>Harga (RM)</Label>
                <Input
                  id={`tiers.${index}.harga`}
                  type="number"
                  step="0.01"
                  {...register(`tiers.${index}.harga`, {
                    valueAsNumber: true,
                    required: 'Harga diperlukan',
                    min: { value: 0, message: 'Mestilah 0 atau lebih' },
                  })}
                  placeholder="0.00"
                />
                {errors.tiers?.[index]?.harga && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tiers[index].harga?.message}
                  </p>
                )}
              </div>
              {tierFields.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeTier(index)}
                >
                  Buang
                </Button>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Sections */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Seksyen</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => appendSection({ tajuk: '', itemsText: '' })}
            >
              + Tambah Seksyen
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {sectionFields.length === 0 && (
            <p className="text-sm text-navy/60">
              Tiada seksyen. Klik &quot;Tambah Seksyen&quot; untuk menambah.
            </p>
          )}
          {sectionFields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded border border-navy/10 p-3"
            >
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor={`sections.${index}.tajuk`}>Tajuk</Label>
                  <Input
                    id={`sections.${index}.tajuk`}
                    {...register(`sections.${index}.tajuk`, {
                      required: 'Tajuk diperlukan',
                    })}
                    placeholder="cth: Menu Kenduri"
                  />
                  {errors.sections?.[index]?.tajuk && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sections[index].tajuk?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeSection(index)}
                >
                  Buang
                </Button>
              </div>
              <div>
                <Label htmlFor={`sections.${index}.itemsText`}>
                  Item (satu per baris)
                </Label>
                <Textarea
                  id={`sections.${index}.itemsText`}
                  {...register(`sections.${index}.itemsText`, {
                    required: 'Sekurang-kurangnya 1 item diperlukan',
                  })}
                  rows={5}
                  placeholder={
                    'Nasi Putih\nAyam Masak Merah\nDaging Rendang'
                  }
                />
                {errors.sections?.[index]?.itemsText && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sections[index].itemsText?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Menyimpan...'
            : isEditing
              ? 'Kemaskini Pakej'
              : 'Tambah Pakej'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/pakej')}
          disabled={isSubmitting}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
