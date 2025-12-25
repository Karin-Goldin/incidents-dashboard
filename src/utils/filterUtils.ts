import { mockdata } from "@/mockdata";
import type { FilterState } from "@/pages/FilterBar";

export type Incident = (typeof mockdata)[0];

export const filterAndSortIncidents = (
  filters: FilterState,
  incidentStatuses: Record<string, string>
): Incident[] => {
  let filtered = [...mockdata];

  // Filter by severity
  if (filters.severities.length > 0) {
    filtered = filtered.filter((incident) =>
      filters.severities.includes(incident.severity)
    );
  }

  // Filter by status
  if (filters.statuses.length > 0) {
    filtered = filtered.filter((incident) => {
      const currentStatus = incidentStatuses[incident.id] || incident.status;
      return filters.statuses.includes(currentStatus);
    });
  }

  // Filter by category
  if (filters.categories.length > 0) {
    filtered = filtered.filter((incident) =>
      filters.categories.includes(incident.category)
    );
  }

  // Filter by IP search
  if (filters.searchIp) {
    const searchLower = filters.searchIp.toLowerCase();
    filtered = filtered.filter((incident) =>
      incident.source.toLowerCase().includes(searchLower)
    );
  }

  // Filter by time range
  if (filters.timeRange && filters.timeRange !== "all") {
    const now = new Date();
    let cutoffDate: Date;

    switch (filters.timeRange) {
      case "24h":
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0); // Should never reach here
    }

    filtered = filtered.filter((incident) => {
      const incidentDate = new Date(incident.timestamp);
      return incidentDate >= cutoffDate;
    });
  }

  // Sort
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === "timestamp") {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        comparison = dateA - dateB;
      } else if (filters.sortBy === "severity") {
        const severityOrder: Record<string, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        comparison =
          (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });
  }

  return filtered;
};
