import { create } from 'zustand';

// --- Auth Store ---
interface AuthState {
  user: { id: string; name: string; email: string; role: string } | null;
  token: string | null;
  credits: number;
  login: (user: any, token: string) => void;
  logout: () => void;
  deductCredits: (amount: number) => void;
  setCredits: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  credits: 0,
  login: (user, token) => set({ user, token, credits: user.credits ?? 0 }),
  logout: () => set({ user: null, token: null }),
  deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  setCredits: (amount) => set({ credits: amount }),
}));

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
interface UIState {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
}));
