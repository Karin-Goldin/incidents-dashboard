import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import FilterBar from "./pages/FilterBar";
import { filterAndSortIncidents } from "./utils/filterUtils";
import type { FilterState } from "./pages/FilterBar";
import { mockdata } from "./mockdata";

function App() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    severities: [],
    statuses: [],
    categories: [],
    searchIp: "",
    sortBy: "",
    sortOrder: "desc",
    timeRange: "all",
  });
  const [incidentStatuses, setIncidentStatuses] = useState<
    Record<string, string>
  >(
    mockdata.reduce(
      (acc, incident) => {
        acc[incident.id] = incident.status;
        return acc;
      },
      {} as Record<string, string>
    )
  );

  // Initialize filters from URL params
  useEffect(() => {
    const severities =
      searchParams.get("severity")?.split(",").filter(Boolean) || [];
    const statuses =
      searchParams.get("status")?.split(",").filter(Boolean) || [];
    const categories =
      searchParams.get("category")?.split(",").filter(Boolean) || [];
    const searchIp = searchParams.get("searchIp") || "";
    const sortBy =
      (searchParams.get("sortBy") as "timestamp" | "severity") || "";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const timeRange =
      (searchParams.get("timeRange") as "all" | "24h" | "7d" | "30d") || "all";

    setFilters({
      severities,
      statuses,
      categories,
      searchIp,
      sortBy,
      sortOrder,
      timeRange,
    });
  }, [searchParams]);

  // Filter and sort the data
  const filteredData = filterAndSortIncidents(filters, incidentStatuses);

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    setIncidentStatuses((prev) => ({
      ...prev,
      [incidentId]: newStatus,
    }));
  };

  return (
    <>
      <Dashboard />
      <FilterBar />
      <DashboardTable
        filteredData={filteredData}
        incidentStatuses={incidentStatuses}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

export default App;
