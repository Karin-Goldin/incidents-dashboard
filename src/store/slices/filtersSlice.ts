import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { FilterState } from "../types";

const initialState: FilterState = {
  severities: [],
  statuses: [],
  categories: [],
  searchIp: "",
  sortBy: "",
  sortOrder: "desc",
  timeRange: "all",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters: (_state, action: PayloadAction<FilterState>) => {
      return action.payload;
    },
    setSeverities: (state, action: PayloadAction<string[]>) => {
      state.severities = action.payload;
    },
    toggleSeverity: (state, action: PayloadAction<string>) => {
      const severity = action.payload;
      if (state.severities.includes(severity)) {
        state.severities = state.severities.filter((s) => s !== severity);
      } else {
        state.severities.push(severity);
      }
    },
    setStatuses: (state, action: PayloadAction<string[]>) => {
      state.statuses = action.payload;
    },
    toggleStatus: (state, action: PayloadAction<string>) => {
      const status = action.payload;
      if (state.statuses.includes(status)) {
        state.statuses = state.statuses.filter((s) => s !== status);
      } else {
        state.statuses.push(status);
      }
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    toggleCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload;
      if (state.categories.includes(category)) {
        state.categories = state.categories.filter((c) => c !== category);
      } else {
        state.categories.push(category);
      }
    },
    setSearchIp: (state, action: PayloadAction<string>) => {
      state.searchIp = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<"timestamp" | "severity" | "">
    ) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },
    setTimeRange: (
      state,
      action: PayloadAction<"all" | "24h" | "7d" | "30d">
    ) => {
      state.timeRange = action.payload;
    },
    clearFilters: () => {
      return initialState;
    },
  },
});

export const {
  setFilters,
  setSeverities,
  toggleSeverity,
  setStatuses,
  toggleStatus,
  setCategories,
  toggleCategory,
  setSearchIp,
  setSortBy,
  setSortOrder,
  setTimeRange,
  clearFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
