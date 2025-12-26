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
    updateIncidentStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      state.statuses[action.payload.id] = action.payload.status;
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

export const { setIncidents, updateIncidentStatus, setStatuses } =
  incidentsSlice.actions;

export default incidentsSlice.reducer;
