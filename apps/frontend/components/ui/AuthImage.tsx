"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  driveFileId?: string;
  fallbackUrl: string;
}

export const AuthImage: React.FC<AuthImageProps> = ({ driveFileId, fallbackUrl, alt, ...props }) => {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    if (driveFileId && driveFileId !== 'saved') {
      api.get(`/integrations/google-drive/file/${driveFileId}`, { responseType: 'blob' })
        .then(res => {
          setSrc(URL.createObjectURL(res.data));
        })
        .catch(() => setSrc(fallbackUrl));
    } else {
      setSrc(fallbackUrl);
    }
  }, [driveFileId, fallbackUrl]);

  return <img src={src} alt={alt || 'Image'} {...props} />;
};
