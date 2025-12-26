import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import FilterBar from "./pages/FilterBar";
import { filterAndSortIncidents } from "./utils/filterUtils";
import {
  useAppDispatch,
  useAppSelector,
  setFilters,
  updateIncidentStatus,
} from "./store";
import Header from "./pages/Header";

function App() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const incidentStatuses = useAppSelector((state) => state.incidents.statuses);
  const [searchParams] = useSearchParams();

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

    dispatch(
      setFilters({
        severities,
        statuses,
        categories,
        searchIp,
        sortBy,
        sortOrder,
        timeRange,
      })
    );
  }, [searchParams, dispatch]);

  // Filter and sort the data
  const filteredData = filterAndSortIncidents(filters, incidentStatuses);

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    dispatch(updateIncidentStatus({ id: incidentId, status: newStatus }));
  };

  return (
    <>
      <Header />
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
