import { create } from "zustand";

export const useOrderStepStore = create((set) => ({
  stepIndex: -1,
  setStepIndex: (idx) => set({ stepIndex: idx }),
}));
