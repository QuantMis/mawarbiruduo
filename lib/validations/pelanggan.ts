import { z } from 'zod';

const MALAYSIAN_PHONE_REGEX = /^(\+?60)?0?1[0-9]-?[0-9]{7,8}$/;

export const pelangganCreateSchema = z.object({
  nama: z
    .string({ error: 'Nama diperlukan' })
    .min(2, 'Nama mestilah sekurang-kurangnya 2 aksara')
    .max(100, 'Nama mestilah tidak melebihi 100 aksara'),
  noTelefon: z
    .string({ error: 'No. telefon diperlukan' })
    .regex(
      MALAYSIAN_PHONE_REGEX,
      'Sila masukkan nombor telefon Malaysia yang sah (cth: 0121234567)',
    ),
  nota: z
    .string()
    .max(500, 'Nota mestilah tidak melebihi 500 aksara')
    .optional(),
});

export const pelangganUpdateSchema = pelangganCreateSchema.partial();

export type PelangganCreateInput = z.infer<typeof pelangganCreateSchema>;
export type PelangganUpdateInput = z.infer<typeof pelangganUpdateSchema>;
