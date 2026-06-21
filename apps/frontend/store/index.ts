import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Auth Store ---
interface AuthState {
  user: { id: string; name: string; email: string; role: string } | null;
  token: string | null;
  credits: number;
  planId: string;
  paymentMethods: any[];
  login: (user: any, token: string) => void;
  logout: () => void;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  setCredits: (amount: number) => void;
  setPlanId: (planId: string) => void;
  setPaymentMethods: (methods: any[]) => void;
  chargeDefaultCard: (amount: number) => { success: boolean; error?: string };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      credits: 0,
      planId: 'free',
      paymentMethods: [
        { id: '1', type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true, limit: 100, balance: 250 },
        { id: '2', type: 'Mastercard', last4: '5555', expiry: '08/25', isDefault: false, limit: 50, balance: 10 },
      ],
      login: (user, token) => set({ user, token, credits: user.credits ?? 0, planId: user.planId ?? 'free' }),
      logout: () => set({ user: null, token: null, planId: 'free' }),
      deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      setCredits: (amount) => set({ credits: amount }),
      setPlanId: (planId) => set({ planId }),
      setPaymentMethods: (methods) => set({ paymentMethods: methods }),
      chargeDefaultCard: (amount) => {
        let result = { success: false, error: '' };
        set((state) => {
          const defaultCard = state.paymentMethods.find(m => m.isDefault);
          if (!defaultCard) {
            result = { success: false, error: 'Оплата отклонена: Нет основной карты для списания.' };
            return state;
          }
          if (amount > defaultCard.limit) {
            result = { success: false, error: `Оплата отклонена: Сумма ($${amount}) превышает доступный лимит карты ($${defaultCard.limit}).` };
            return state;
          }
          if (amount > defaultCard.balance) {
            result = { success: false, error: `Оплата отклонена: Недостаточно средств на балансе карты (Доступно: $${defaultCard.balance}).` };
            return state;
          }
          
          result = { success: true };
          return {
            paymentMethods: state.paymentMethods.map(m => 
              m.id === defaultCard.id ? { ...m, limit: m.limit - amount, balance: m.balance - amount } : m
            )
          };
        });
        return result;
      },
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ credits: state.credits, planId: state.planId, user: state.user, paymentMethods: state.paymentMethods }), // only save these fields
    }
  )
);

// --- Generation Store ---
interface GenerationState {
  prompt: string;
  negativePrompt: string;
  model: string;
  settings: { width: number; height: number; steps: number; cfg: number };
  isGenerating: boolean;
  progress: number;
  resultImage: string | null;
  initImage: string | null; // Base64 or Object URL
  
  setPrompt: (v: string) => void;
  setNegativePrompt: (v: string) => void;
  setModel: (v: string) => void;
  updateSetting: (key: string, value: number) => void;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (v: number) => void;
  setResult: (url: string) => void;
  setInitImage: (v: string | null) => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  prompt: '',
  negativePrompt: '',
  model: 'sdxl-1.0',
  settings: { width: 1024, height: 1024, steps: 30, cfg: 7.5 },
  isGenerating: false,
  progress: 0,
  resultImage: null,
  initImage: null,

  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setModel: (model) => set({ model }),
  updateSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setResult: (resultImage) => set({ resultImage }),
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
  preferences: UIPreferences;
  setPreferences: (prefs: Partial<UIPreferences>) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
  preferences: {
    theme: 'DARK',
    accentColor: 'INDIGO',
    fontSize: 'MEDIUM',
    compactMode: false,
    animationsEnabled: true,
  },
  setPreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
}));
