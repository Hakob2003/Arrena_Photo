'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { Switch } from '@headlessui/react';
import { cn } from '@/lib/utils';

export default function NotificationsProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      notifyEmail: true,
      notifyGenerations: true,
      notifyMarketing: false,
      notifyNews: true,
      notifySystem: true,
    }
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/profile/me');
        reset({
          notifyEmail: !!data.notifyEmail,
          notifyGenerations: !!data.notifyGenerations,
          notifyMarketing: !!data.notifyMarketing,
          notifyNews: !!data.notifyNews,
          notifySystem: !!data.notifySystem,
        });
      } catch (error) {
        toast.error('Failed to load notification settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [reset]);

  const onSubmit = async (values: any) => {
    try {
      setIsSaving(true);
      await api.patch('/profile/notifications', values);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setIsSaving(false);
    }
  };

  const toggles = [
    {
      name: 'notifyEmail',
      title: 'Email Notifications',
      description: 'Receive important account updates and security alerts via email.',
      disabled: true // Usually security emails cannot be turned off
    },
    {
      name: 'notifyGenerations',
      title: 'Generation Alerts',
      description: 'Get notified when your long-running AI generations are complete.',
      disabled: false
    },
    {
      name: 'notifyMarketing',
      title: 'Marketing & Offers',
      description: 'Receive promotions, discounts, and marketing emails.',
      disabled: false
    },
    {
      name: 'notifyNews',
      title: 'Product News',
      description: 'Stay up to date with new models, features, and platform updates.',
      disabled: false
    },
    {
      name: 'notifySystem',
      title: 'System Notifications',
      description: 'In-app notifications about system maintenance and updates.',
      disabled: false
    }
  ];

  if (isLoading) {
    return <div className="animate-pulse space-y-8"><div className="h-40 bg-muted/50 rounded-xl"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Notifications</h2>
        <p className="text-muted-foreground text-sm">Choose what we notify you about and how we communicate.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6 border-t border-border">
        {toggles.map((item, idx) => (
          <Controller
            key={item.name}
            control={control}
            name={item.name as any}
            render={({ field }) => (
              <div className={cn("flex items-center justify-between", idx !== 0 && "pt-6 border-t border-border")}>
                <div className="pr-8">
                  <h3 className={cn("text-base font-medium mb-1", item.disabled ? "text-muted-foreground" : "text-foreground")}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={item.disabled}
                  className={cn(
                    field.value ? 'bg-primary' : 'bg-gray-600',
                    item.disabled && 'opacity-50 cursor-not-allowed',
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
        ))}

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
