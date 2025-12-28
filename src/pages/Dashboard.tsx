import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
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
import { useAppSelector, selectAllIncidents } from "@/store";
import { getThemeColor } from "@/utils/themeHelpers";
import {
  countIncidentsBySeverity,
  countIncidentsByStatus,
  getTrendData,
} from "@/utils/incidentUtils";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const incidents = useAppSelector(selectAllIncidents);
  const incidentStatuses = useAppSelector((state) => state.incidents.statuses);
  const isLoading = useAppSelector((state) => state.incidents.isLoading);

  const severityCounts = countIncidentsBySeverity(incidents);
  const total = incidents.length;
  const statusCounts = countIncidentsByStatus(incidents, incidentStatuses);

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

  const trendData = getTrendData(incidents);
  const maxCount = Math.max(...trendData.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-2 md:p-4">
      <Card className="py-4 flex flex-col h-full">
        <CardHeader className="pb-0 pt-2 px-2 md:px-4 flex justify-between items-center flex-wrap gap-2">
          <h4 className="font-bold text-base md:text-large">
            Incidents Breakdown
          </h4>
          <span className="px-2 md:px-3 py-1 rounded-full bg-primary/20 text-primary text-xs md:text-sm font-medium">
            total: {total}
          </span>
        </CardHeader>
        <CardBody className="px-2 md:px-4 py-2 flex-1 flex flex-col justify-center">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Spinner size="lg" />
            </div>
          ) : (
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
          )}
        </CardBody>
      </Card>
      <Card className="py-4 flex flex-col h-full">
        <CardHeader className="pb-0 pt-2 px-2 md:px-4 flex-col items-start">
          <h4 className="font-bold text-base md:text-large">Status Summary</h4>
        </CardHeader>
        <CardBody className="overflow-visible py-2 px-2 md:px-4 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Spinner size="lg" />
            </div>
          ) : statusData.length > 0 ? (
            <div className="flex flex-col items-center flex-1 justify-between">
              <div className="w-full h-[150px] md:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
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
              </div>
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
        <CardHeader className="pb-0 pt-2 px-2 md:px-4 flex-col items-start">
          <h4 className="font-bold text-base md:text-large">Incident Trend</h4>
          <small className="text-default-500 text-xs md:text-sm">
            Last 7 days
          </small>
        </CardHeader>
        <CardBody className="px-2 md:px-4 py-4 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div className="w-full h-[150px] md:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#71717a"
                    />
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
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-2">
                <div className="text-xs md:text-sm text-default-500">
                  Total incidents:{" "}
                  <strong className="text-foreground">{total}</strong>
                </div>
                <div className="text-xs md:text-sm text-default-500">
                  Peak: <strong className="text-foreground">{maxCount}</strong>{" "}
                  incidents/day
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
