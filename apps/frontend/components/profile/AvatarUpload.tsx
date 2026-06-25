'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import { Camera, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

export default function AvatarUpload({ currentAvatarUrl, onUpload, onRemove }: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result as string));
      reader.readAsDataURL(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => {
      toast.error('File rejected. Max size is 5MB and must be an image.');
    }
  });

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      setIsUploading(true);
      const croppedImage = await getCroppedImg(imageSrc!, croppedAreaPixels!);
      const file = new File([croppedImage], 'avatar.jpg', { type: 'image/jpeg' });
      await onUpload(file);
      setImageSrc(null);
      toast.success('Avatar updated successfully');
    } catch (e: any) {
      console.error('Avatar upload error:', e);
      toast.error(e?.response?.data?.message || e.message || 'Failed to crop or upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div 
        {...getRootProps()}
        className="relative group cursor-pointer w-24 h-24 rounded-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0"
      >
        <input {...getInputProps()} />
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-8 h-8 text-slate-400 dark:text-gray-500" />
        )}
        <div className="absolute inset-0 bg-[#fafafa] dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-slate-900 dark:text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg text-sm hover:bg-gray-200 transition"
          >
            Change picture
          </button>
          {currentAvatarUrl && (
            <button 
              type="button"
              onClick={onRemove}
              className="p-2 text-slate-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-gray-500">
          JPG, PNG or WEBP. Max size of 5MB.
        </p>
      </div>

      {/* Crop Modal */}
      <AnimatePresence>
        {imageSrc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#fafafa] dark:bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setImageSrc(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-[#fafafa] dark:bg-black/50 hover:bg-black/[0.05] dark:bg-white/10 rounded-full text-slate-900 dark:text-slate-900 dark:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-semibold mb-6">Crop your picture</h3>
              
              <div className="relative w-full h-64 bg-[#fafafa] dark:bg-black/50 rounded-xl overflow-hidden mb-6">
                {/* @ts-ignore - TS thinks Cropper is not a valid JSX element in this React version */}
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setImageSrc(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/[0.05] dark:bg-white/10 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCrop}
                  disabled={isUploading}
                  className="px-6 py-2 bg-white text-black font-medium rounded-lg text-sm hover:bg-gray-200 transition flex items-center justify-center min-w-[100px]"
                >
                  {isUploading ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span> : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
