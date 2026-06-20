'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { Monitor, Smartphone, Globe, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecurityProfilePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await api.get('/profile/security/sessions');
        setSessions(data);
      } catch (error) {
        toast.error('Failed to load sessions');
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      setIsChangingPassword(true);
      await api.patch('/profile/security/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated successfully');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to sign out from all other devices?')) return;
    try {
      const { data } = await api.post('/profile/security/logout-all');
      toast.success(`Signed out from ${data.count} devices`);
      // Reload sessions
      const res = await api.get('/profile/security/sessions');
      setSessions(res.data);
    } catch (error) {
      toast.error('Failed to sign out from devices');
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Change Password */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Change Password</h2>
          <p className="text-gray-400 text-sm">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Current Password</label>
            <input 
              type="password"
              {...register('currentPassword')} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition"
            />
            {errors.currentPassword && <p className="text-red-400 text-xs">{errors.currentPassword.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">New Password</label>
              <input 
                type="password"
                {...register('newPassword')} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition"
              />
              {errors.newPassword && <p className="text-red-400 text-xs">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Confirm Password</label>
              <input 
                type="password"
                {...register('confirmPassword')} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition"
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isChangingPassword}
              className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition flex items-center justify-center min-w-[140px]"
            >
              {isChangingPassword ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Sessions */}
      <div className="pt-10 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Active Sessions</h2>
            <p className="text-gray-400 text-sm">Manage your active sessions across different devices.</p>
          </div>
          <button 
            onClick={handleLogoutAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out all devices
          </button>
        </div>

        {isLoadingSessions ? (
          <div className="space-y-4">
            <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div key={session.id || idx} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="p-3 bg-white/5 rounded-lg shrink-0">
                  {session.device?.toLowerCase().includes('phone') || session.device?.toLowerCase().includes('mobile') 
                    ? <Smartphone className="w-6 h-6 text-gray-400" />
                    : <Monitor className="w-6 h-6 text-gray-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{session.device || session.userAgent || 'Unknown Device'}</p>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] uppercase font-bold rounded-full">Current</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ipAddress || 'Unknown IP'}</span>
                    <span>•</span>
                    <span>{session.country || 'Unknown Location'}</span>
                    <span>•</span>
                    <span>Started {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No active sessions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
