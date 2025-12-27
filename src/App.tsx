import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import FilterBar from "./pages/FilterBar";
import Login from "./pages/Login";
import { filterAndSortIncidents } from "./utils/filterUtils";
import {
  useAppDispatch,
  useAppSelector,
  setFilters,
  updateIncidentStatus,
  fetchIncidents,
  addIncident,
} from "./store";
import { websocketService } from "./services/websocketService";
import { setStatus, setLastUpdate } from "./store";
import Header from "./pages/Header";

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const filters = useAppSelector((state) => state.filters);
  const incidentStatuses = useAppSelector((state) => state.incidents.statuses);
  const [searchParams] = useSearchParams();

  // Fetch incidents on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchIncidents());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      websocketService.disconnect();
      return;
    }

    const connectTimeout = setTimeout(() => {
      websocketService.connect(token, {
        onNewIncident: (incident) => {
          dispatch(addIncident(incident));
        },
        onUpdateIncident: (incident) => {
          dispatch(addIncident(incident));
        },
        onConnect: () => {
          dispatch(setStatus("connected"));
          dispatch(setLastUpdate(Date.now()));
        },
        onDisconnect: () => {
          if (websocketService.getReadyState() === WebSocket.CLOSED) {
            dispatch(setStatus("disconnected"));
          } else {
            dispatch(setStatus("reconnecting"));
          }
        },
        onError: (error) => {
          dispatch(setStatus("disconnected"));
        },
      });

      return () => {
        clearTimeout(connectTimeout);
        websocketService.disconnect();
      };
    }, 100);

    return () => {
      clearTimeout(connectTimeout);
      websocketService.disconnect();
    };
  }, [isAuthenticated, token, dispatch]);

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

  // Get incidents from Redux
  const incidents = useAppSelector((state) => state.incidents.incidents);

  // Filter and sort the data
  const filteredData = filterAndSortIncidents(
    incidents,
    filters,
    incidentStatuses
  );

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    dispatch(updateIncidentStatus({ id: incidentId, status: newStatus }));
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

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
