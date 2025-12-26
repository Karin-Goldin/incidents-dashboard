import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockdata } from "@/mockdata";
import type { IncidentStatuses } from "../types";
import type { Incident } from "@/utils/filterUtils";

// Initialize incident statuses from mockdata
const initialStatuses: IncidentStatuses = mockdata.reduce(
  (acc, incident) => {
    acc[incident.id] = incident.status;
    return acc;
  },
  {} as IncidentStatuses
);

interface IncidentsState {
  incidents: Incident[];
  statuses: IncidentStatuses;
}

const initialState: IncidentsState = {
  incidents: mockdata,
  statuses: initialStatuses,
};

const incidentsSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.incidents = action.payload;
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
});

export const { setIncidents, updateIncidentStatus, setStatuses } =
  incidentsSlice.actions;

export default incidentsSlice.reducer;

