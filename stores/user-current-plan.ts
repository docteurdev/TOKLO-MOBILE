import { ISubscription } from "@/interfaces/type";
import { userZustandStorage } from "@/storages/user";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CurrentPlanInitialState {
  current_plan: ISubscription | null;
}

interface CurrentPlanState extends CurrentPlanInitialState {
  setCurrentPlan: (currentPlan: ISubscription) => void;
  clearCurrentPlan: () => void;
}

const initialState: CurrentPlanInitialState = {
  current_plan: null,
};

export const useCurrentPlanStore = create<CurrentPlanState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentPlan: (currentPlan: ISubscription) =>
        set((state) => {
          return { ...state, current_plan: currentPlan };
        }),
      clearCurrentPlan: () =>
        set((state) => {
          return { ...state, ...initialState };
        }),
    }),
    {
      name: "currentPlanStore",
      storage: createJSONStorage(() => userZustandStorage),
    },
  ),
);
