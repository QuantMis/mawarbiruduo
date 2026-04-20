import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { successResponse, errorResponse } from '@/lib/api';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'pakej');

function getExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };
  return map[mime] ?? 'bin';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const oldImage = formData.get('oldImage');

    if (!file || !(file instanceof File)) {
      return errorResponse('No file provided', 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      return errorResponse('Invalid file type. Only JPG and PNG are allowed.', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File too large. Maximum size is 5MB.', 400);
    }

    const extension = getExtensionFromMime(file.type);
    const filename = `${randomUUID()}.${extension}`;

    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(UPLOAD_DIR, filename);
    await writeFile(filePath, buffer);

    // Delete old image if provided
    if (oldImage && typeof oldImage === 'string' && oldImage.startsWith('/uploads/pakej/')) {
      const oldFilePath = join(process.cwd(), 'public', oldImage);
      try {
        await unlink(oldFilePath);
      } catch {
        // Old file may not exist — ignore silently
      }
    }

    const url = `/uploads/pakej/${filename}`;
    return successResponse({ url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return errorResponse(message, 500);
  }
}
