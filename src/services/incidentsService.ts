import apiClient from "./api";
import type { Incident } from "@/types/incident";

export const incidentsService = {
  async getIncidents(): Promise<Incident[]> {
    const response = await apiClient.get("/api/incidents");

    // Handle different possible response formats
    const data = response.data;

    // If data is wrapped in an object, extract the array
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const extracted = (data as any).incidents || (data as any).data || [];
      return Array.isArray(extracted) ? extracted : [];
    }

    return Array.isArray(data) ? data : [];
  },
};
