import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import FilterBar from "./pages/FilterBar";
import Login from "./pages/Login";
import { filterAndSortIncidents } from "./utils/filterUtils";
import { parseFiltersFromUrl } from "./utils/urlUtils";
import {
  useAppDispatch,
  useAppSelector,
  setFilters,
  updateIncidentStatus,
  updateIncidentStatusAsync,
  fetchIncidents,
  addIncident,
  selectAllIncidents,
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

          dispatch(setLastUpdate(Date.now()));
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
        onError: () => {
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
    const filtersFromUrl = parseFiltersFromUrl(searchParams);
    dispatch(setFilters(filtersFromUrl));
  }, [searchParams, dispatch]);

  // Get incidents from Redux using normalized selector
  const incidents = useAppSelector(selectAllIncidents);
  // Get connection status from Redux
  const connectionStatus = useAppSelector((state) => state.connection.status);

  // Filter and sort the data - all incidents
  const allFilteredData = filterAndSortIncidents(
    incidents,
    filters,
    incidentStatuses
  );

  // Filter non-resolved incidents only (for "Incidents" tab)
  const incidentsFilteredData = allFilteredData.filter((incident) => {
    const currentStatus = incidentStatuses[incident.id] || incident.status;
    return currentStatus !== "RESOLVED";
  });

  // Filter resolved incidents only (for "Resolved" tab)
  const resolvedFilteredData = allFilteredData.filter((incident) => {
    const currentStatus = incidentStatuses[incident.id] || incident.status;
    return currentStatus === "RESOLVED";
  });

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    // Update locally first for immediate UI feedback (optimistic update)
    dispatch(
      updateIncidentStatus({
        id: incidentId,
        status: newStatus,
      })
    );

    // Then send update to server
    dispatch(
      updateIncidentStatusAsync({
        id: incidentId,
        status: newStatus as "OPEN" | "ESCALATED" | "RESOLVED",
      })
    );
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      <Header status={connectionStatus} />
      <Dashboard />
      <FilterBar />
      <div>
        <DashboardTable
          filteredData={incidentsFilteredData}
          incidentStatuses={incidentStatuses}
          onStatusChange={handleStatusChange}
          allIncidentsData={incidentsFilteredData}
          resolvedIncidentsData={resolvedFilteredData}
        />
      </div>
    </>
  );
}

export default App;
