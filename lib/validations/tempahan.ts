import { z } from 'zod';

export const tempahanCreateSchema = z.object({
  namaTempahan: z
    .string({ error: 'Nama tempahan diperlukan' })
    .min(2, 'Nama tempahan mestilah sekurang-kurangnya 2 aksara')
    .max(200, 'Nama tempahan mestilah tidak melebihi 200 aksara'),
  slotTempahanId: z
    .string({ error: 'Slot tempahan diperlukan' })
    .min(1, 'Slot tempahan diperlukan'),
  pakejId: z
    .string({ error: 'Pakej diperlukan' })
    .min(1, 'Pakej diperlukan'),
  pelangganId: z
    .string({ error: 'Pelanggan diperlukan' })
    .min(1, 'Pelanggan diperlukan'),
  nota: z
    .string()
    .max(500, 'Nota mestilah tidak melebihi 500 aksara')
    .optional(),
});

export const tempahanUpdateSchema = z.object({
  namaTempahan: z
    .string()
    .min(2, 'Nama tempahan mestilah sekurang-kurangnya 2 aksara')
    .max(200, 'Nama tempahan mestilah tidak melebihi 200 aksara')
    .optional(),
  pakejId: z.string().min(1, 'Pakej diperlukan').optional(),
  pelangganId: z.string().min(1, 'Pelanggan diperlukan').optional(),
  nota: z
    .string()
    .max(500, 'Nota mestilah tidak melebihi 500 aksara')
    .nullable()
    .optional(),
});

export type TempahanCreateInput = z.infer<typeof tempahanCreateSchema>;
export type TempahanUpdateInput = z.infer<typeof tempahanUpdateSchema>;
