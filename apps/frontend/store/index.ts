import { create } from 'zustand';

// --- Auth Store ---
interface AuthState {
  user: { id: string; name: string; email: string; role: string } | null;
  credits: number;
  login: (user: any) => void;
  logout: () => void;
  deductCredits: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'CREATOR' }, // Mock default
  credits: 1500,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
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
  
  setPrompt: (v: string) => void;
  setNegativePrompt: (v: string) => void;
  setModel: (v: string) => void;
  updateSetting: (key: string, value: number) => void;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (v: number) => void;
  setResult: (url: string) => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  prompt: '',
  negativePrompt: '',
  model: 'sdxl-1.0',
  settings: { width: 1024, height: 1024, steps: 30, cfg: 7.5 },
  isGenerating: false,
  progress: 0,
  resultImage: null,

  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setModel: (model) => set({ model }),
  updateSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setResult: (resultImage) => set({ resultImage }),
}));
