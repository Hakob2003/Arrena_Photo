'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { Switch } from '@headlessui/react';
import { Monitor, Moon, Sun, Palette, Type, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import { useTranslation } from '@/lib/i18n';

export default function AppearanceProfilePage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { setPreferences } = useUIStore();

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      theme: 'SYSTEM',
      accentColor: 'INDIGO',
      fontSize: 'MEDIUM',
      compactMode: false,
      animationsEnabled: true,
      skin: 'NEON',
    }
  });

  const watchTheme = watch('theme');
  const watchAccent = watch('accentColor');
  const watchFont = watch('fontSize');
  const watchSkin = watch('skin');

  // Instantly apply changes to the UI store for real-time preview
  useEffect(() => {
    const subscription = watch((value) => {
      setPreferences({
        theme: value.theme as any,
        accentColor: value.accentColor as any,
        fontSize: value.fontSize as any,
        compactMode: value.compactMode,
        animationsEnabled: value.animationsEnabled,
        skin: value.skin as any,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setPreferences]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data } = await api.get('/profile/me');
        const fetchedPrefs = {
          theme: data.theme || 'SYSTEM',
          accentColor: data.accentColor || 'INDIGO',
          fontSize: data.fontSize || 'MEDIUM',
          compactMode: !!data.compactMode,
          animationsEnabled: data.animationsEnabled !== false,
          skin: data.skin || 'NEON',
        };
        reset(fetchedPrefs);
        setPreferences(fetchedPrefs);
      } catch (error) {
        toast.error('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, [reset]);

  const onSubmit = async (values: any) => {
    try {
      setIsSaving(true);
      await api.patch('/profile/preferences', values);
      setPreferences(values);
      toast.success('Appearance updated successfully');
    } catch (error) {
      toast.error('Failed to update appearance');
    } finally {
      setIsSaving(false);
    }
  };

  const themes = [
    { id: 'LIGHT', icon: Sun, label: t('profile.appearance.light') },
    { id: 'DARK', icon: Moon, label: t('profile.appearance.dark') },
    { id: 'SYSTEM', icon: Monitor, label: t('profile.appearance.system') },
  ];

  const colors = [
    { id: 'INDIGO', bg: 'bg-indigo-500' },
    { id: 'ROSE', bg: 'bg-rose-500' },
    { id: 'EMERALD', bg: 'bg-emerald-500' },
    { id: 'AMBER', bg: 'bg-amber-500' },
    { id: 'BLUE', bg: 'bg-blue-500' },
    { id: 'SUNSET', bg: 'bg-gradient-to-br from-orange-400 to-rose-500' },
    { id: 'OCEAN', bg: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
    { id: 'AMETHYST', bg: 'bg-gradient-to-br from-fuchsia-500 to-purple-600' },
    { id: 'FLAME', bg: 'bg-gradient-to-br from-yellow-400 to-red-600' },
    { id: 'GALAXY', bg: 'bg-gradient-to-br from-indigo-600 to-purple-800' },
    { id: 'PEACH', bg: 'bg-gradient-to-br from-rose-300 to-orange-300' },
    { id: 'CANDY', bg: 'bg-gradient-to-br from-pink-400 to-violet-400' },
    { id: 'MINT', bg: 'bg-gradient-to-br from-emerald-300 to-cyan-400' },
    { id: 'FOREST', bg: 'bg-gradient-to-br from-green-500 to-emerald-700' },
    { id: 'BERRY', bg: 'bg-gradient-to-br from-rose-500 to-purple-700' },
    { id: 'DAWN', bg: 'bg-gradient-to-br from-yellow-300 to-pink-300' },
    { id: 'LAGOON', bg: 'bg-gradient-to-br from-cyan-500 to-blue-700' },
    { id: 'MANGO', bg: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
    { id: 'GRAPE', bg: 'bg-gradient-to-br from-purple-400 to-indigo-600' },
    { id: 'ROSEGOLD', bg: 'bg-gradient-to-br from-rose-300 to-amber-200' },
  ];

  const fonts = [
    { id: 'SMALL', label: 'Small', class: 'text-sm' },
    { id: 'MEDIUM', label: 'Medium', class: 'text-base' },
    { id: 'LARGE', label: 'Large', class: 'text-lg' },
  ];

  if (isLoading) {
    return <div className="animate-pulse space-y-8"><div className="h-40 bg-black/[0.05] dark:bg-white/10 rounded-xl"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold mb-1">{t('profile.appearance.title')}</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm">{t('profile.appearance.desc')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-6 border-t border-black/10 dark:border-white/10">
        
        {/* Skin Selector */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-slate-900 dark:text-white mb-1">{t('profile.appearance.skinTitle')}</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">{t('profile.appearance.skinDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue('skin', 'LUXURY', { shouldDirty: true })}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all overflow-hidden text-left",
                watchSkin === 'LUXURY'
                  ? "border-[#D4AF37] bg-black/5 shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                  : "border-black/10 dark:border-white/10 hover:border-white/30 bg-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white"
              )}
            >
              <div className="absolute inset-0 bg-[#050505] -z-10" />
              <div className="w-full flex justify-between items-center mb-2">
                <span className={cn("font-medium text-lg", watchSkin === 'LUXURY' ? "text-[#D4AF37]" : "text-gray-300")}>Luxury Gold</span>
                {watchSkin === 'LUXURY' && <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />}
              </div>
              <p className="text-xs text-gray-400">{t('profile.appearance.skinLuxuryDesc')}</p>
            </button>

            <button
              type="button"
              onClick={() => setValue('skin', 'NEON', { shouldDirty: true })}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all overflow-hidden text-left",
                watchSkin === 'NEON'
                  ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                  : "border-black/10 dark:border-white/10 hover:border-white/30 bg-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white"
              )}
            >
              <div className="absolute inset-0 bg-[#fafafa] dark:bg-[#0A0A0A] -z-10" />
              <div className="w-full flex justify-between items-center mb-2">
                <span className={cn("font-medium text-lg", watchSkin === 'NEON' ? "text-indigo-500 dark:text-indigo-400" : "")}>Neon Cyberpunk</span>
                {watchSkin === 'NEON' && <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">{t('profile.appearance.skinNeonDesc')}</p>
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
          <div>
            <h3 className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-white mb-1">{t('profile.appearance.theme')}</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Select or customize your UI theme.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = watchTheme === themeOption.id;
              return (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => setValue('theme', themeOption.id, { shouldDirty: true })}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all",
                    isActive 
                      ? "border-white bg-black/[0.05] dark:bg-white/10" 
                      : "border-black/10 dark:border-white/10 hover:border-white/30 bg-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-sm">{themeOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color */}
        {watchSkin !== 'LUXURY' && (
          <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-white mb-1">{t('profile.appearance.accent')}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Choose your primary brand color.</p>
            </div>
            <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto no-scrollbar pb-2 pt-2 px-1">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setValue('accentColor', c.id, { shouldDirty: true })}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-transform",
                    c.bg,
                    watchAccent === c.id ? "ring-2 ring-white ring-offset-2 ring-offset-[#111] scale-110" : "hover:scale-110"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Font Size */}
        <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
          <div>
            <h3 className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-white mb-1">{t('profile.appearance.fontSize')}</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">{t('profile.appearance.fontSizeDesc')}</p>
          </div>
          <div className="flex bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-1 w-fit">
            {fonts.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setValue('fontSize', f.id, { shouldDirty: true })}
                className={cn(
                  "px-6 py-2 rounded-md transition-colors",
                  watchFont === f.id ? "bg-white text-black font-medium" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white",
                  f.class
                )}
              >
                Aa
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-6 pt-6 border-t border-black/10 dark:border-white/10">
          <Controller
            control={control}
            name="compactMode"
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-white">{t('profile.appearance.compactMode')}</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">{t('profile.appearance.compactModeDesc')}</p>
                </div>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className={cn(
                    field.value ? 'bg-white' : 'bg-gray-600',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      field.value ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-transparent shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5'
                    )}
                  />
                </Switch>
              </div>
            )}
          />

          <Controller
            control={control}
            name="animationsEnabled"
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-white">{t('profile.appearance.animations')}</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">{t('profile.appearance.animationsDesc')}</p>
                </div>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className={cn(
                    field.value ? 'bg-white' : 'bg-gray-600',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      field.value ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-transparent shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5'
                    )}
                  />
                </Switch>
              </div>
            )}
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-black/10 dark:border-white/10">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition flex items-center justify-center min-w-[120px]"
          >
            {isSaving ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span> : t('profile.appearance.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
