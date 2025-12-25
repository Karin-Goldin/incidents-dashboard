import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { mockdata } from "@/mockdata";
import warningAnimation from "../../warning.json";

const DashboardTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const [incidentStatuses, setIncidentStatuses] = useState<
    Record<string, string>
  >(
    mockdata.reduce(
      (acc, incident) => {
        acc[incident.id] = incident.status;
        return acc;
      },
      {} as Record<string, string>
    )
  );

  const totalPages = Math.ceil(mockdata.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = mockdata.slice(startIndex, endIndex);
  // Map severity to Chip color
  const getChipSeverityColor = (
    severity: string
  ): "danger" | "warning" | "primary" | "success" => {
    const severityMap: Record<
      string,
      "danger" | "warning" | "primary" | "success"
    > = {
      CRITICAL: "danger",
      HIGH: "warning",
      MEDIUM: "primary",
      LOW: "success",
    };
    return severityMap[severity] || "default";
  };

  const getChipSeverityClasses = (severity: string): string => {
    const classMap: Record<string, string> = {
      CRITICAL: "bg-danger-50 text-danger",
      HIGH: "bg-warning-50 text-warning",
      MEDIUM: "bg-primary-50 text-primary",
      LOW: "bg-success-50 text-success",
    };
    return classMap[severity] || "";
  };

  const getStatusColor = (
    status: string
  ): "primary" | "warning" | "success" | "default" => {
    const statusMap: Record<
      string,
      "primary" | "warning" | "success" | "default"
    > = {
      OPEN: "primary",
      ESCALATED: "warning",
      RESOLVED: "success",
    };
    return statusMap[status] || "default";
  };

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    setIncidentStatuses((prev) => ({
      ...prev,
      [incidentId]: newStatus,
    }));
  };

  // Format timestamp to "Tue Jun 24 2025 09:49:53" format
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${dayName} ${monthName} ${day} ${year} ${hours}:${minutes}:${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner
            classNames={{ label: "text-foreground mt-4" }}
            label="Loading incidents..."
            variant="gradient"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn className="text-center">SEVERITY</TableColumn>
          <TableColumn className="text-center">CATEGORY</TableColumn>
          <TableColumn className="text-center">SOURCE</TableColumn>
          <TableColumn className="text-center">TIMESTAMP</TableColumn>
          <TableColumn className="text-center">STATUS</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedData.map((incident) => {
            const currentStatus =
              incidentStatuses[incident.id] || incident.status;
            const isCriticalOpen =
              incident.severity === "CRITICAL" && currentStatus === "OPEN";

            return (
              <TableRow key={incident.id}>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center relative">
                    <Chip
                      color={getChipSeverityColor(incident.severity)}
                      variant="flat"
                      className={getChipSeverityClasses(incident.severity)}
                    >
                      {incident.severity}
                    </Chip>
                    {isCriticalOpen && (
                      <div className="absolute left-[calc(50%+2.5rem)] top-1/2 -translate-y-1/2 w-10 h-10 flex-shrink-0">
                        <Lottie
                          animationData={warningAnimation}
                          loop={true}
                          autoplay={true}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {incident.category}
                </TableCell>
                <TableCell className="text-center">{incident.source}</TableCell>
                <TableCell className="text-center">
                  {formatTimestamp(incident.timestamp)}
                </TableCell>
                <TableCell className="text-center">
                  <Dropdown className="text-center">
                    <DropdownTrigger className="text-center">
                      <Button
                        variant="solid"
                        color={getStatusColor(incidentStatuses[incident.id])}
                        size="sm"
                        className="text-white"
                      >
                        {incidentStatuses[incident.id]}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Status actions"
                      onAction={(key) =>
                        handleStatusChange(incident.id, key as string)
                      }
                      selectedKeys={[incidentStatuses[incident.id]]}
                      selectionMode="single"
                    >
                      <DropdownItem key="OPEN" color="primary">
                        OPEN
                      </DropdownItem>
                      <DropdownItem key="ESCALATED" color="warning">
                        ESCALATED
                      </DropdownItem>
                      <DropdownItem key="RESOLVED" color="success">
                        RESOLVED
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-4">
        <Pagination
          isCompact
          showControls
          initialPage={1}
          page={currentPage}
          total={totalPages}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default DashboardTable;
