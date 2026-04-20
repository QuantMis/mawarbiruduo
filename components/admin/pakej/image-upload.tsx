'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  readonly currentImage?: string | null;
  readonly onUploaded: (url: string) => void;
}

export function ImageUpload({ currentImage, onUploaded }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);

      // Client-side validation
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG and PNG files are allowed.');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 5MB.');
        return;
      }

      // Show local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (currentImage) {
          formData.append('oldImage', currentImage);
        }

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.error ?? 'Upload failed');
          setPreview(null);
          return;
        }

        onUploaded(result.data.url);
      } catch {
        setError('Network error. Please try again.');
        setPreview(null);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [currentImage, onUploaded],
  );

  const displayImage = preview ?? currentImage;

  return (
    <div className="space-y-3">
      {displayImage && (
        <div className="relative h-40 w-40 overflow-hidden rounded-md border">
          <Image
            src={displayImage}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={preview !== null}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          disabled={isUploading}
        />
        {isUploading && (
          <span className="text-sm text-gray-500">Uploading...</span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
