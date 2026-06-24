"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  driveFileId?: string;
  fallbackUrl: string;
}

export const AuthImage: React.FC<AuthImageProps> = ({ driveFileId, fallbackUrl, alt, ...props }) => {
  const [src, setSrc] = useState<string>(() => {
    let finalFallback = fallbackUrl;
    if (finalFallback && !finalFallback.startsWith('http') && !finalFallback.startsWith('data:') && (!finalFallback.startsWith('/') || finalFallback.length > 500)) {
      finalFallback = `data:image/png;base64,${finalFallback}`;
    }
    return finalFallback;
  });

  useEffect(() => {
    let finalFallback = fallbackUrl;
    if (finalFallback && !finalFallback.startsWith('http') && !finalFallback.startsWith('data:') && (!finalFallback.startsWith('/') || finalFallback.length > 500)) {
      finalFallback = `data:image/png;base64,${finalFallback}`;
    }
    
    // Set src immediately to fallback while checking drive (if needed)
    setSrc(finalFallback);

    // If we already have the full image via data URI, there's no need to download it again from Google Drive!
    if (finalFallback && finalFallback.startsWith('data:')) {
      return;
    }

    if (driveFileId && driveFileId !== 'saved') {
      api.get(`/integrations/google-drive/file/${driveFileId}`, { responseType: 'blob' })
        .then(res => {
          setSrc(URL.createObjectURL(res.data));
        })
        .catch(() => setSrc(finalFallback));
    } else {
      setSrc(finalFallback);
    }
  }, [driveFileId, fallbackUrl]);

  const handleError = () => {
    let finalFallback = fallbackUrl;
    if (finalFallback && !finalFallback.startsWith('http') && !finalFallback.startsWith('data:') && (!finalFallback.startsWith('/') || finalFallback.length > 500)) {
      finalFallback = `data:image/png;base64,${finalFallback}`;
    }
    if (src !== finalFallback) {
      setSrc(finalFallback);
    }
  };

  return <img src={src} alt={alt || 'Image'} onError={handleError} {...props} />;
};
