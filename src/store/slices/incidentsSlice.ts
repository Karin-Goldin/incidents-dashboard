import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { incidentsService } from "@/services/incidentsService";
import type { IncidentStatuses } from "../types";
import type { Incident } from "@/types/incident";

// Create entity adapter for normalized state management
const incidentsAdapter = createEntityAdapter<Incident>({
  // Sort by timestamp descending (most recent first)
  sortComparer: (a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
});

interface IncidentsState
  extends ReturnType<typeof incidentsAdapter.getInitialState> {
  statuses: IncidentStatuses;
  isLoading: boolean;
  error: string | null;
  lastFailedAction: {
    type: "fetch" | "updateStatus" | null;
    params?: { id: string; status: string };
  };
}

// Load saved statuses from localStorage on initialization
const loadSavedStatuses = (): IncidentStatuses => {
  try {
    const saved = localStorage.getItem("incidentStatuses");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const initialState: IncidentsState = incidentsAdapter.getInitialState({
  statuses: loadSavedStatuses(),
  isLoading: false,
  error: null,
  lastFailedAction: {
    type: null,
  },
});

// Async thunk to fetch incidents from API
export const fetchIncidents = createAsyncThunk(
  "incidents/fetchIncidents",
  async (_, { rejectWithValue }) => {
    try {
      const incidents = await incidentsService.getIncidents();

      // Validate incidents structure
      if (!Array.isArray(incidents)) {
        return rejectWithValue("Invalid incidents data format");
      }

      // Initialize statuses from fetched incidents
      const statuses: IncidentStatuses = incidents.reduce((acc, incident) => {
        if (incident && incident.id && incident.status) {
          acc[incident.id] = incident.status;
        }
        return acc;
      }, {} as IncidentStatuses);

      return { incidents, statuses };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch incidents"
      );
    }
  }
);

// Async thunk to update incident status on server
export const updateIncidentStatusAsync = createAsyncThunk(
  "incidents/updateIncidentStatus",
  async (
    { id, status }: { id: string; status: "OPEN" | "ESCALATED" | "RESOLVED" },
    { rejectWithValue }
  ) => {
    try {
      const updatedIncident = await incidentsService.updateIncidentStatus(
        id,
        status
      );
      return { id, status, incident: updatedIncident };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update incident status"
      );
    }
  }
);

const incidentsSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      incidentsAdapter.setAll(state, action.payload);
      // Update statuses when incidents are set
      state.statuses = action.payload.reduce((acc, incident) => {
        acc[incident.id] = incident.status;
        return acc;
      }, {} as IncidentStatuses);
    },
    addIncident: (state, action: PayloadAction<Incident>) => {
      // upsertOne handles both add and update (O(1) operation)
      incidentsAdapter.upsertOne(state, action.payload);
      state.statuses[action.payload.id] = action.payload.status;
    },
    updateIncident: (state, action: PayloadAction<Incident>) => {
      // updateOne is O(1) operation
      incidentsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload,
      });
      state.statuses[action.payload.id] = action.payload.status;
    },
    updateIncidentStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      state.statuses[action.payload.id] = action.payload.status;
      // Update the incident object if it exists (O(1) operation)
      const existingIncident = state.entities[action.payload.id];
      if (existingIncident) {
        incidentsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { status: action.payload.status as Incident["status"] },
        });
      }
      // Persist status changes to localStorage
      localStorage.setItem("incidentStatuses", JSON.stringify(state.statuses));
    },
    setStatuses: (state, action: PayloadAction<IncidentStatuses>) => {
      state.statuses = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.lastFailedAction = { type: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastFailedAction = { type: null };
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.isLoading = false;

        // Load saved status changes from localStorage
        const savedStatusesStr = localStorage.getItem("incidentStatuses");
        const savedStatuses: IncidentStatuses = savedStatusesStr
          ? JSON.parse(savedStatusesStr)
          : {};

        // Merge saved statuses with current state (current state takes precedence)
        const localStatuses = { ...savedStatuses, ...state.statuses };

        // Apply saved/local status changes to incidents from server before setting them
        const incidentsWithLocalStatuses = action.payload.incidents.map(
          (incident) => {
            if (localStatuses[incident.id]) {
              // Use the saved/local status instead of server status
              return {
                ...incident,
                status: localStatuses[incident.id] as Incident["status"],
              };
            }
            return incident;
          }
        );

        // Update incidents from server (O(n) operation, but only on fetch)
        incidentsAdapter.setAll(state, incidentsWithLocalStatuses);

        // Update statuses map
        incidentsWithLocalStatuses.forEach((incident) => {
          state.statuses[incident.id] = incident.status;
        });

        // Save the merged statuses back to localStorage
        localStorage.setItem(
          "incidentStatuses",
          JSON.stringify(state.statuses)
        );

        state.error = null;
        state.lastFailedAction = { type: null };
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.lastFailedAction = { type: "fetch" };
      })
      .addCase(updateIncidentStatusAsync.fulfilled, (state, action) => {
        // Update status in both statuses map and incident object (O(1) operation)
        state.statuses[action.payload.id] = action.payload.status;
        const existingIncident = state.entities[action.payload.id];
        if (existingIncident) {
          incidentsAdapter.updateOne(state, {
            id: action.payload.id,
            changes: { status: action.payload.status },
          });
        }
        // Persist status changes to localStorage
        localStorage.setItem(
          "incidentStatuses",
          JSON.stringify(state.statuses)
        );
        // Clear any previous errors on successful update
        state.error = null;
        state.lastFailedAction = { type: null };
      })
      .addCase(updateIncidentStatusAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // Store the failed action parameters for retry
        const meta = action.meta;
        if (meta.arg) {
          state.lastFailedAction = {
            type: "updateStatus",
            params: meta.arg as { id: string; status: string },
          };
        }
      });
  },
});

export const {
  setIncidents,
  addIncident,
  updateIncident,
  updateIncidentStatus,
  setStatuses,
  clearError,
} = incidentsSlice.actions;

// Export selectors for normalized state
// These selectors will be properly typed when used with RootState in components
export const {
  selectAll: selectAllIncidents,
  selectById: selectIncidentById,
  selectIds: selectIncidentIds,
  selectEntities: selectIncidentEntities,
  selectTotal: selectIncidentTotal,
} = incidentsAdapter.getSelectors<{ incidents: IncidentsState }>(
  (state) => state.incidents
);

export default incidentsSlice.reducer;
