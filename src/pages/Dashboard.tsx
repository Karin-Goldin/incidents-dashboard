import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useAppSelector } from "@/store";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const incidents = useAppSelector((state) => state.incidents.incidents);
  const incidentStatuses = useAppSelector((state) => state.incidents.statuses);
  // an helper function to get the color from the theme for rechart
  const getThemeColor = (colorName: string): string => {
    const tempEl = document.createElement("div");
    const colorClassMap: Record<string, string> = {
      primary: "text-primary",
      warning: "text-warning",
      success: "text-success",
    };

    tempEl.className = colorClassMap[colorName] || "text-primary";
    tempEl.style.position = "absolute";
    tempEl.style.visibility = "hidden";
    document.body.appendChild(tempEl);

    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    return computedColor;
  };

  const severityCounts = incidents.reduce(
    (acc, incident) => {
      const severity = incident.severity;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const total = incidents.length;

  const statusCounts = incidents.reduce(
    (acc, incident) => {
      // Use current status from Redux if available, otherwise use incident.status
      const currentStatus = incidentStatuses[incident.id] || incident.status;
      acc[currentStatus] = (acc[currentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusData = [
    {
      name: "OPEN",
      value: statusCounts.OPEN || 0,
      color: getThemeColor("primary"),
    },
    {
      name: "ESCALATED",
      value: statusCounts.ESCALATED || 0,
      color: getThemeColor("warning"),
    },
    {
      name: "RESOLVED",
      value: statusCounts.RESOLVED || 0,
      color: getThemeColor("success"),
    },
  ].filter((item) => item.value > 0);

  const severities = [
    {
      name: "CRITICAL",
      color: "bg-danger",
      count: severityCounts.CRITICAL || 0,
    },
    { name: "HIGH", color: "bg-warning", count: severityCounts.HIGH || 0 },
    { name: "MEDIUM", color: "bg-primary", count: severityCounts.MEDIUM || 0 },
    { name: "LOW", color: "bg-success", count: severityCounts.LOW || 0 },
  ];

  // Handle severity card click to filter table
  const handleSeverityClick = (severityName: string) => {
    const currentSeverities =
      searchParams.get("severity")?.split(",").filter(Boolean) || [];

    const isSelected = currentSeverities.includes(severityName);
    let newSeverities: string[];

    if (isSelected) {
      // Remove severity if already selected
      newSeverities = currentSeverities.filter((s) => s !== severityName);
    } else {
      // Add severity if not selected
      newSeverities = [...currentSeverities, severityName];
    }

    const params = new URLSearchParams(searchParams);

    if (newSeverities.length > 0) {
      params.set("severity", newSeverities.join(","));
    } else {
      params.delete("severity");
    }

    setSearchParams(params, { replace: true });
  };

  // Get current selected severities from URL
  const selectedSeverities =
    searchParams.get("severity")?.split(",").filter(Boolean) || [];

  // Handle pie chart click to filter table by status
  const handlePieClick = (data: any) => {
    if (data && data.name) {
      const statusName = data.name;
      const currentStatuses =
        searchParams.get("status")?.split(",").filter(Boolean) || [];

      const isSelected = currentStatuses.includes(statusName);
      let newStatuses: string[];

      if (isSelected) {
        // Remove status if already selected
        newStatuses = currentStatuses.filter((s) => s !== statusName);
      } else {
        // Add status if not selected
        newStatuses = [...currentStatuses, statusName];
      }

      const params = new URLSearchParams(searchParams);

      if (newStatuses.length > 0) {
        params.set("status", newStatuses.join(","));
      } else {
        params.delete("status");
      }

      setSearchParams(params, { replace: true });
    }
  };

  const getTrendData = () => {
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

  const trendData = getTrendData();
  const maxCount = Math.max(...trendData.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <Card className="py-4 flex flex-col h-full">
        <CardHeader className="pb-0 pt-2 px-4 flex justify-between items-center">
          <h4 className="font-bold text-large">Incidents Breakdown</h4>
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            total: {total}
          </span>
        </CardHeader>
        <CardBody className="px-4 py-2 flex-1 flex flex-col justify-center">
          <div className="space-y-2 w-full">
            {severities.map((severity) => {
              const isSelected = selectedSeverities.includes(severity.name);
              return (
                <Card
                  key={severity.name}
                  className={`w-full py-2 px-3 shadow-none ${
                    isSelected
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-default-100 border-2 border-transparent"
                  } hover:bg-default-200 cursor-pointer transition-colors`}
                  isPressable
                  onPress={() => handleSeverityClick(severity.name)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={`${severity.color} w-1 h-8 rounded-full flex-shrink-0`}
                    />
                    <span className="font-medium text-left">
                      {severity.name}
                    </span>
                    <span className="font-semibold flex-shrink-0 ml-auto">
                      {severity.count}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardBody>
      </Card>
      <Card className="py-4 flex flex-col h-full">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-large">Status Summary</h4>
        </CardHeader>
        <CardBody className="overflow-visible py-2 px-2 flex-1 flex flex-col">
          {statusData.length > 0 ? (
            <div className="flex flex-col items-center flex-1 justify-between">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart className="w-full h-full">
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="55%"
                    innerRadius="65%"
                    outerRadius="80%"
                    cornerRadius="50%"
                    paddingAngle={5}
                    labelLine={true}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    fill="#8884d8"
                    dataKey="value"
                    onClick={handlePieClick}
                    style={{ cursor: "pointer" }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">
                      {item.name}: <strong>{item.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-default-500">No data available</p>
          )}
        </CardBody>
      </Card>
      <Card className="py-4 flex flex-col h-full">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-large">Incident Trend</h4>
          <small className="text-default-500">Last 7 days</small>
        </CardHeader>
        <CardBody className="px-4 py-4 flex-1 flex flex-col">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#71717a" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#71717a"
                domain={[0, maxCount + 1]}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#006FEE"
                strokeWidth={2}
                dot={{ fill: "#006FEE", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-between items-center px-2">
            <div className="text-sm text-default-500">
              Total incidents:{" "}
              <strong className="text-foreground">{total}</strong>
            </div>
            <div className="text-sm text-default-500">
              Peak: <strong className="text-foreground">{maxCount}</strong>{" "}
              incidents/day
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
