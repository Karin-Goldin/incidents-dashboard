import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { incidentsService } from "@/services/incidentsService";
import type { IncidentStatuses } from "../types";
import type { Incident } from "@/types/incident";

interface IncidentsState {
  incidents: Incident[];
  statuses: IncidentStatuses;
  isLoading: boolean;
  error: string | null;
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

const initialState: IncidentsState = {
  incidents: [],
  statuses: loadSavedStatuses(),
  isLoading: false,
  error: null,
};

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
      state.incidents = action.payload;
      // Update statuses when incidents are set
      state.statuses = action.payload.reduce((acc, incident) => {
        acc[incident.id] = incident.status;
        return acc;
      }, {} as IncidentStatuses);
    },
    addIncident: (state, action: PayloadAction<Incident>) => {
      // Check if incident already exists (avoid duplicates)
      const existingIndex = state.incidents.findIndex(
        (inc) => inc.id === action.payload.id
      );

      if (existingIndex === -1) {
        // Add new incident at the beginning (most recent first)
        state.incidents.unshift(action.payload);
        state.statuses[action.payload.id] = action.payload.status;
      } else {
        // Update existing incident
        state.incidents[existingIndex] = action.payload;
        state.statuses[action.payload.id] = action.payload.status;
      }
    },
    updateIncident: (state, action: PayloadAction<Incident>) => {
      const index = state.incidents.findIndex(
        (inc) => inc.id === action.payload.id
      );

      if (index !== -1) {
        state.incidents[index] = action.payload;
        state.statuses[action.payload.id] = action.payload.status;
      }
    },
    updateIncidentStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      state.statuses[action.payload.id] = action.payload.status;
      // Also update the incident object if it exists
      const incident = state.incidents.find(
        (inc) => inc.id === action.payload.id
      );
      if (incident) {
        incident.status = action.payload.status as Incident["status"];
      }
      // Persist status changes to localStorage
      localStorage.setItem("incidentStatuses", JSON.stringify(state.statuses));
    },
    setStatuses: (state, action: PayloadAction<IncidentStatuses>) => {
      state.statuses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
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

        // Update incidents from server
        state.incidents = action.payload.incidents;

        // Apply saved/local status changes to incidents from server
        action.payload.incidents.forEach((incident) => {
          if (localStatuses[incident.id]) {
            // Use the saved/local status instead of server status
            state.statuses[incident.id] = localStatuses[incident.id];
            // Also update the incident object
            const index = state.incidents.findIndex(
              (inc) => inc.id === incident.id
            );
            if (index !== -1) {
              state.incidents[index].status = localStatuses[
                incident.id
              ] as Incident["status"];
            }
          } else {
            // Use server status if no local change
            state.statuses[incident.id] = incident.status;
          }
        });

        // Save the merged statuses back to localStorage
        localStorage.setItem(
          "incidentStatuses",
          JSON.stringify(state.statuses)
        );

        state.error = null;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateIncidentStatusAsync.fulfilled, (state, action) => {
        // Update status in both statuses map and incident object
        state.statuses[action.payload.id] = action.payload.status;
        const incident = state.incidents.find(
          (inc) => inc.id === action.payload.id
        );
        if (incident) {
          incident.status = action.payload.status;
        }
        // Persist status changes to localStorage
        localStorage.setItem(
          "incidentStatuses",
          JSON.stringify(state.statuses)
        );
      })
      .addCase(updateIncidentStatusAsync.rejected, (state, action) => {
        // Optionally handle error (could show a toast notification)
        state.error = action.payload as string;
      });
  },
});

export const {
  setIncidents,
  addIncident,
  updateIncident,
  updateIncidentStatus,
  setStatuses,
} = incidentsSlice.actions;

export default incidentsSlice.reducer;
