import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Auth Store ---
interface AuthState {
  user: { id: string; name: string; email: string; role: string } | null;
  token: string | null;
  credits: number;
  planId: string;
  paymentMethods: any[];
  fetchPaymentMethods: () => Promise<void>;
  login: (user: any, token: string) => void;
  logout: () => void;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  setCredits: (amount: number) => void;
  setPlanId: (planId: string) => void;
  setPaymentMethods: (methods: any[]) => void;
  setDefaultPaymentMethod: (id: string) => Promise<{ success: boolean; error?: string }>;
  chargeDefaultCard: (amount: number, reason: string) => Promise<{ success: boolean; error?: string }>;
}

import { api } from '../lib/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      credits: 0,
      planId: 'free',
      paymentMethods: [],
      fetchPaymentMethods: async () => {
        const currentState = useAuthStore.getState();
        if (!currentState.token) {
          set({ paymentMethods: [] });
          return;
        }
        try {
          const res = await api.get('/billing/payment-methods');
          set({ paymentMethods: res.data });
        } catch (e) {
          console.error(e);
          set({ paymentMethods: [] }); // Clear on error (e.g. 401)
        }
      },
      login: (user, token) => set({ user, token, credits: user.credits ?? 0, planId: user.planId ?? 'free' }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ user: null, token: null, planId: 'free', credits: 0, paymentMethods: [] });
      },
      deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      setCredits: (amount) => set({ credits: amount }),
      setPlanId: (planId) => set({ planId }),
      setPaymentMethods: (methods) => set({ paymentMethods: methods }),
      setDefaultPaymentMethod: async (id) => {
        try {
          await api.put(`/billing/payment-methods/${id}/default`);
          // optimistically update
          set((state) => ({
            paymentMethods: state.paymentMethods.map(m => 
              m.id === id ? { ...m, isDefault: true } : { ...m, isDefault: false }
            )
          }));
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.response?.data?.message || 'Error setting default payment method' };
        }
      },
      chargeDefaultCard: async (amount, reason) => {
        try {
          await api.post('/billing/charge', { amount, reason });
          // If successful, refresh the payment methods to get new balance
          const res = await api.get('/billing/payment-methods');
          set({ paymentMethods: res.data });
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.response?.data?.message || 'Ошибка оплаты' };
        }
      },
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ credits: state.credits, planId: state.planId, user: state.user }), // don't persist payment methods locally anymore
    }
  )
);

// --- Generation Store ---
interface GenerationState {
  prompt: string;
  negativePrompt: string;
  model: string;
  aspectRatio: string;
  resolution: string;
  settings: { width: number; height: number; steps: number; cfg: number };
  isGenerating: boolean;
  progress: number;
  resultImage: string | null;
  resultDriveFileId: string | null;
  initImage: string | null; // Base64 or Object URL
  
  setPrompt: (v: string) => void;
  setNegativePrompt: (v: string) => void;
  setModel: (v: string) => void;
  setAspectRatio: (v: string) => void;
  setResolution: (v: string) => void;
  updateSetting: (key: string, value: number) => void;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (v: number) => void;
  setResult: (url: string, driveFileId?: string) => void;
  setInitImage: (v: string | null) => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  prompt: '',
  negativePrompt: '',
  model: 'sdxl-1.0',
  aspectRatio: '1:1',
  resolution: '1K',
  settings: { width: 1024, height: 1024, steps: 30, cfg: 7.5 },
  isGenerating: false,
  progress: 0,
  resultImage: null,
  resultDriveFileId: null,
  initImage: null,

  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setModel: (model) => set({ model }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setResolution: (resolution) => set({ resolution }),
  updateSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setResult: (resultImage, resultDriveFileId = undefined) => set({ resultImage, resultDriveFileId: resultDriveFileId ?? null }),
  setInitImage: (initImage) => set({ initImage }),
}));

// --- UI Store ---
interface UIPreferences {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  accentColor: 'INDIGO' | 'ROSE' | 'EMERALD' | 'AMBER' | 'BLUE';
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  compactMode: boolean;
  animationsEnabled: boolean;
}

interface UIState {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;
  locale: 'ru' | 'en';
  setLocale: (v: 'ru' | 'en') => void;
  preferences: UIPreferences;
  setPreferences: (prefs: Partial<UIPreferences>) => void;
}

const getInitialLocale = (): 'ru' | 'en' => {
  return 'ru'; // Always return 'ru' initially to prevent hydration mismatch
};

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
  locale: getInitialLocale(),
  setLocale: (locale) => {
    if (typeof window !== 'undefined') localStorage.setItem('locale', locale);
    set({ locale });
  },
  preferences: {
    theme: 'DARK',
    accentColor: 'INDIGO',
    fontSize: 'MEDIUM',
    compactMode: false,
    animationsEnabled: true,
  },
  setPreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
}));
