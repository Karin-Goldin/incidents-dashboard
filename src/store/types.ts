export type FilterState = {
  severities: string[];
  statuses: string[];
  categories: string[];
  searchIp: string;
  sortBy: "timestamp" | "severity" | "";
  sortOrder: "asc" | "desc";
  timeRange: "all" | "24h" | "7d" | "30d";
};

export type IncidentStatuses = Record<string, string>;

