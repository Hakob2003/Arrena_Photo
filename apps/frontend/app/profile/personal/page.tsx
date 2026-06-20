'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import AvatarUpload from '@/components/profile/AvatarUpload';

const personalSchema = z.object({
  name: z.string().max(30).optional(),
  surname: z.string().max(30).optional(),
  nickname: z.string().min(3, "Nickname must be at least 3 characters").max(20).optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  socialLinks: z.object({
    telegram: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

export default function PersonalProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/me');
        setAvatarUrl(data.avatarUrl);
        reset({
          name: data.name || '',
          surname: data.surname || '',
          nickname: data.nickname || '',
          bio: data.bio || '',
          socialLinks: data.socialLinks || { telegram: '', instagram: '', twitter: '', linkedin: '', website: '' },
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (values: PersonalFormValues) => {
    try {
      setIsSaving(true);
      await api.patch('/profile/info', values);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setAvatarUrl(data.avatarUrl);
  };

  const handleAvatarRemove = async () => {
    await api.delete('/profile/avatar');
    setAvatarUrl(null);
    toast.success('Avatar removed');
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-24 w-24 bg-muted/50 rounded-full" />
      <div className="h-10 bg-muted/50 rounded-lg w-1/2" />
      <div className="h-10 bg-muted/50 rounded-lg w-full" />
      <div className="h-32 bg-muted/50 rounded-lg w-full" />
    </div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Personal Information</h2>
        <p className="text-muted-foreground text-sm">Update your photo and personal details here.</p>
      </div>

      <div className="pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Profile Picture</h3>
        <AvatarUpload 
          currentAvatarUrl={avatarUrl} 
          onUpload={handleAvatarUpload} 
          onRemove={handleAvatarRemove} 
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">First Name</label>
            <input 
              {...register('name')} 
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-white/30 transition"
              placeholder="e.g. John"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Last Name</label>
            <input 
              {...register('surname')} 
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-white/30 transition"
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Nickname</label>
          <input 
            {...register('nickname')} 
            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-white/30 transition"
            placeholder="@johndoe"
          />
          {errors.nickname && <p className="text-red-400 text-xs">{errors.nickname.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Bio</label>
          <textarea 
            {...register('bio')} 
            rows={4}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-white/30 transition resize-none"
            placeholder="Write a few sentences about yourself..."
          />
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Telegram</label>
              <input {...register('socialLinks.telegram')} className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:border-white/30" placeholder="t.me/username" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Instagram</label>
              <input {...register('socialLinks.instagram')} className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:border-white/30" placeholder="instagram.com/username" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">X (Twitter)</label>
              <input {...register('socialLinks.twitter')} className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:border-white/30" placeholder="x.com/username" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Website</label>
              <input {...register('socialLinks.website')} className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:border-white/30" placeholder="https://yourwebsite.com" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition flex items-center justify-center min-w-[120px]"
          >
            {isSaving ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
