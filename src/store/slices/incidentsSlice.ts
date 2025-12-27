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

const initialState: IncidentsState = {
  incidents: [],
  statuses: {},
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
        state.incidents = action.payload.incidents;
        state.statuses = action.payload.statuses;
        state.error = null;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
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
