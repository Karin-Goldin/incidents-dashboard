import type { Incident } from "@/types/incident";

export const countIncidentsBySeverity = (
  incidents: Incident[]
): Record<string, number> => {
  return incidents.reduce(
    (acc, incident) => {
      const severity = incident.severity;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
};

export const countIncidentsByStatus = (
  incidents: Incident[],
  incidentStatuses: Record<string, string>
): Record<string, number> => {
  return incidents.reduce(
    (acc, incident) => {
      // Use current status from Redux if available, otherwise use incident.status
      const currentStatus = incidentStatuses[incident.id] || incident.status;
      acc[currentStatus] = (acc[currentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
};

export const getTrendData = (
  incidents: Incident[]
): Array<{ date: string; count: number }> => {
  if (incidents.length === 0) {
    // Return empty data for last 7 days if no incidents
    const days: Array<{ date: string; count: number }> = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: 0,
      });
    }
    return days;
  }

  const latestDate = incidents.reduce((latest, incident) => {
    const incidentDate = new Date(incident.timestamp);
    return incidentDate > latest ? incidentDate : latest;
  }, new Date(incidents[0].timestamp));

  const days: Array<{ date: Date; dateStr: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(latestDate);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push({
      date: date,
      dateStr: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: 0,
    });
  }

  incidents.forEach((incident) => {
    const incidentDate = new Date(incident.timestamp);
    incidentDate.setHours(0, 0, 0, 0);

    const dayData = days.find(
      (d) => d.date.getTime() === incidentDate.getTime()
    );
    if (dayData) {
      dayData.count++;
    }
  });

  return days.map((d) => ({ date: d.dateStr, count: d.count }));
};
