import { create } from 'zustand';

export type DeadlineFilter = 'ANY' | 'THIS_WEEK' | 'THIS_MONTH';

interface ChallengeFilters {
  search: string;
  industries: string[];
  prizeRange: [number, number];
  deadline: DeadlineFilter;
  difficulties: string[];
}

interface ChallengeState {
  filters: ChallengeFilters;
  setSearch: (search: string) => void;
  toggleIndustry: (industry: string) => void;
  setPrizeRange: (range: [number, number]) => void;
  setDeadline: (deadline: DeadlineFilter) => void;
  toggleDifficulty: (difficulty: string) => void;
  resetFilters: () => void;
}

const initialFilters: ChallengeFilters = {
  search: '',
  industries: [],
  prizeRange: [0, 100000],
  deadline: 'ANY',
  difficulties: [],
};

export const useChallengeStore = create<ChallengeState>((set) => ({
  filters: initialFilters,
  setSearch: (search) => {
    set((s) => ({ filters: { ...s.filters, search } }));
  },
  toggleIndustry: (industry) => {
    set((s) => ({
      filters: {
        ...s.filters,
        industries: s.filters.industries.includes(industry)
          ? s.filters.industries.filter((i) => i !== industry)
          : [...s.filters.industries, industry],
      },
    }));
  },
  setPrizeRange: (prizeRange) => {
    set((s) => ({ filters: { ...s.filters, prizeRange } }));
  },
  setDeadline: (deadline) => {
    set((s) => ({ filters: { ...s.filters, deadline } }));
  },
  toggleDifficulty: (difficulty) => {
    set((s) => ({
      filters: {
        ...s.filters,
        difficulties: s.filters.difficulties.includes(difficulty)
          ? s.filters.difficulties.filter((d) => d !== difficulty)
          : [...s.filters.difficulties, difficulty],
      },
    }));
  },
  resetFilters: () => {
    set({ filters: initialFilters });
  },
}));
