import type { FilterState } from "@/store";

export const parseFiltersFromUrl = (
  searchParams: URLSearchParams
): FilterState => {
  const severities =
    searchParams.get("severity")?.split(",").filter(Boolean) || [];
  const statuses = searchParams.get("status")?.split(",").filter(Boolean) || [];
  const categories =
    searchParams.get("category")?.split(",").filter(Boolean) || [];
  const searchIp = searchParams.get("searchIp") || "";
  const sortBy = (searchParams.get("sortBy") as "timestamp" | "severity") || "";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const timeRange =
    (searchParams.get("timeRange") as "all" | "24h" | "7d" | "30d") || "all";

  return {
    severities,
    statuses,
    categories,
    searchIp,
    sortBy,
    sortOrder,
    timeRange,
  };
};

export const updateFiltersInUrl = (
  filters: FilterState,
  setSearchParams: (
    params: URLSearchParams,
    options?: { replace?: boolean }
  ) => void
): void => {
  const params = new URLSearchParams();

  if (filters.severities.length > 0) {
    params.set("severity", filters.severities.join(","));
  }
  if (filters.statuses.length > 0) {
    params.set("status", filters.statuses.join(","));
  }
  if (filters.categories.length > 0) {
    params.set("category", filters.categories.join(","));
  }
  if (filters.searchIp) {
    params.set("searchIp", filters.searchIp);
  }
  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
    params.set("sortOrder", filters.sortOrder);
  }
  if (filters.timeRange && filters.timeRange !== "all") {
    params.set("timeRange", filters.timeRange);
  }

  setSearchParams(params, { replace: true });
};
