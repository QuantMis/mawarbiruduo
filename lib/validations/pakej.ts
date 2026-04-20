import { z } from 'zod';

const tierSchema = z.object({
  namaTier: z
    .string({ message: 'Nama tier diperlukan' })
    .min(1, 'Nama tier diperlukan')
    .max(100, 'Nama tier mestilah tidak melebihi 100 aksara'),
  bilanganPax: z
    .number({ message: 'Bilangan pax diperlukan' })
    .int('Bilangan pax mestilah nombor bulat')
    .min(0, 'Bilangan pax mestilah 0 atau lebih'),
  harga: z
    .number({ message: 'Harga diperlukan' })
    .min(0, 'Harga mestilah 0 atau lebih'),
});

const sectionSchema = z.object({
  tajuk: z
    .string({ message: 'Tajuk diperlukan' })
    .min(1, 'Tajuk diperlukan')
    .max(200, 'Tajuk mestilah tidak melebihi 200 aksara'),
  items: z
    .array(z.string().min(1, 'Item tidak boleh kosong'))
    .min(1, 'Sekurang-kurangnya 1 item diperlukan'),
});

export const createPakejSchema = z.object({
  namaPakej: z
    .string({ message: 'Nama pakej diperlukan' })
    .min(1, 'Nama pakej diperlukan')
    .max(200, 'Nama pakej mestilah tidak melebihi 200 aksara'),
  warna: z
    .string({ message: 'Warna diperlukan' })
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Warna mestilah format hex yang sah (cth: #FF0000)'),
  tiers: z
    .array(tierSchema)
    .min(1, 'Sekurang-kurangnya 1 tier diperlukan'),
  sections: z.array(sectionSchema).default([]),
});

export const updatePakejSchema = createPakejSchema;

export type CreatePakejInput = z.infer<typeof createPakejSchema>;
export type UpdatePakejInput = z.infer<typeof updatePakejSchema>;
export type TierInput = z.infer<typeof tierSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
