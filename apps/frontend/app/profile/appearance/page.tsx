'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { Switch } from '@headlessui/react';
import { Monitor, Moon, Sun, Palette, Type, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';

export default function AppearanceProfilePage() {
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
    }
  });

  const watchTheme = watch('theme');
  const watchAccent = watch('accentColor');
  const watchFont = watch('fontSize');

  // Instantly apply changes to the UI store for real-time preview
  useEffect(() => {
    const subscription = watch((value) => {
      setPreferences({
        theme: value.theme as any,
        accentColor: value.accentColor as any,
        fontSize: value.fontSize as any,
        compactMode: value.compactMode,
        animationsEnabled: value.animationsEnabled,
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
    { id: 'LIGHT', icon: Sun, label: 'Light' },
    { id: 'DARK', icon: Moon, label: 'Dark' },
    { id: 'SYSTEM', icon: Monitor, label: 'System' },
  ];

  const colors = [
    { id: 'INDIGO', bg: 'bg-indigo-500' },
    { id: 'ROSE', bg: 'bg-rose-500' },
    { id: 'EMERALD', bg: 'bg-emerald-500' },
    { id: 'AMBER', bg: 'bg-amber-500' },
    { id: 'BLUE', bg: 'bg-blue-500' },
  ];

  const fonts = [
    { id: 'SMALL', label: 'Small', class: 'text-sm' },
    { id: 'MEDIUM', label: 'Medium', class: 'text-base' },
    { id: 'LARGE', label: 'Large', class: 'text-lg' },
  ];

  if (isLoading) {
    return <div className="animate-pulse space-y-8"><div className="h-40 bg-muted/50 rounded-xl"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Appearance</h2>
        <p className="text-muted-foreground text-sm">Customize how the application looks and feels.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-6 border-t border-border">
        {/* Theme */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-foreground mb-1">Theme</h3>
            <p className="text-sm text-muted-foreground">Select or customize your UI theme.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = watchTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setValue('theme', t.id, { shouldDirty: true })}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all",
                    isActive 
                      ? "border-white bg-muted/50" 
                      : "border-border hover:border-white/30 bg-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-sm">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div>
            <h3 className="text-base font-medium text-foreground mb-1">Accent Color</h3>
            <p className="text-sm text-muted-foreground">Choose your primary brand color.</p>
          </div>
          <div className="flex items-center gap-4">
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

        {/* Font Size */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div>
            <h3 className="text-base font-medium text-foreground mb-1">Font Size</h3>
            <p className="text-sm text-muted-foreground">Adjust the interface text size.</p>
          </div>
          <div className="flex bg-muted border border-border rounded-lg p-1 w-fit">
            {fonts.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setValue('fontSize', f.id, { shouldDirty: true })}
                className={cn(
                  "px-6 py-2 rounded-md transition-colors",
                  watchFont === f.id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground",
                  f.class
                )}
              >
                Aa
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-6 pt-6 border-t border-border">
          <Controller
            control={control}
            name="compactMode"
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-foreground">Compact Mode</h3>
                  <p className="text-sm text-muted-foreground">Decrease spacing to fit more content on screen.</p>
                </div>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className={cn(
                    field.value ? 'bg-primary' : 'bg-gray-600',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      field.value ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5'
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
                  <h3 className="text-base font-medium text-foreground">Interface Animations</h3>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and micro-interactions.</p>
                </div>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className={cn(
                    field.value ? 'bg-primary' : 'bg-gray-600',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      field.value ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5'
                    )}
                  />
                </Switch>
              </div>
            )}
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-border">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition flex items-center justify-center min-w-[120px]"
          >
            {isSaving ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span> : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
