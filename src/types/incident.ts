export interface Incident {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  source: string;
  timestamp: string;
  status: "OPEN" | "ESCALATED" | "RESOLVED";
}

