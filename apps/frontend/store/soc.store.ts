import { create } from "zustand";
import { socApi } from "../lib/soc.api";

interface SocState {
  dashboardData: any | null;
  isLoading: boolean;
  lastUpdated: number | null;
  timeframe: string;
  error: string | null;

  setTimeframe: (timeframe: string) => void;
  fetchDashboard: (force?: boolean) => Promise<void>;
}

export const useSocStore = create<SocState>((set, get) => ({
  dashboardData: null,
  isLoading: false,
  lastUpdated: null,
  timeframe: "24h",
  error: null,

  setTimeframe: (timeframe: string) => {
    set({ timeframe });
    get().fetchDashboard(true);
  },

  fetchDashboard: async (force = false) => {
    const { lastUpdated, isLoading, timeframe } = get();

    // Cache for 30 seconds unless forced
    if (
      !force &&
      lastUpdated &&
      Date.now() - lastUpdated < 30000 &&
      !isLoading
    ) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await socApi.getDashboard(timeframe);
      set({
        dashboardData: data,
        lastUpdated: Date.now(),
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error:
          err.response?.data?.message || "Failed to fetch SOC Dashboard data",
        isLoading: false,
      });
    }
  },
}));
