import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
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
import { useAppSelector } from "@/store";
import {
  getChipSeverityColor,
  getChipSeverityClasses,
  getStatusColor,
} from "@/utils/themeHelpers";
import { formatTimestamp } from "@/utils/dateUtils";
import warningAnimation from "../../warning.json";
import type { Incident } from "@/types/incident";

interface DashboardTableProps {
  filteredData: Incident[];
  incidentStatuses: Record<string, string>;
  onStatusChange: (incidentId: string, newStatus: string) => void;
  allIncidentsData?: Incident[];
  resolvedIncidentsData?: Incident[];
}

const DashboardTable = ({
  filteredData,
  incidentStatuses,
  onStatusChange,
  allIncidentsData,
  resolvedIncidentsData,
}: DashboardTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("incidents");
  const rowsPerPage = 5;
  const isLoading = useAppSelector((state) => state.incidents.isLoading);

  // Determine which data to use based on tab selection
  const dataToDisplay =
    selectedTab === "resolved" && resolvedIncidentsData
      ? resolvedIncidentsData
      : allIncidentsData || filteredData;

  // Reset to page 1 when data changes or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dataToDisplay.length, selectedTab]);

  const totalPages = Math.ceil(dataToDisplay.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = dataToDisplay.slice(startIndex, endIndex);

  const handleStatusChange = (incidentId: string, newStatus: string) => {
    onStatusChange(incidentId, newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] py-4">
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
    <Card className="-ml-2">
      <CardBody>
        <Tabs
          aria-label="Incidents tabs"
          selectedKey={selectedTab}
          onSelectionChange={(key: string | number) =>
            setSelectedTab(key as string)
          }
          className="mb-4 ml-4"
        >
          <Tab key="incidents" title="Incidents" />
          <Tab key="resolved" title="Resolved" />
        </Tabs>
        <Table aria-label="Example static collection table" className="">
          <TableHeader>
            <TableColumn className="text-center">SEVERITY</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>SOURCE</TableColumn>
            <TableColumn>TIMESTAMP</TableColumn>
            <TableColumn className="pl-6 pr-0">STATUS</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              dataToDisplay.length === 0 ? "No incidents found" : undefined
            }
          >
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No incidents to display
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((incident) => {
                const currentStatus =
                  incidentStatuses[incident.id] || incident.status;
                const isCriticalOpen =
                  incident.severity === "CRITICAL" && currentStatus === "OPEN";

                return (
                  <TableRow
                    key={incident.id}
                    className="hover:bg-default-100 cursor-pointer transition-colors"
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center relative">
                        <Chip
                          color={getChipSeverityColor(incident.severity)}
                          variant="flat"
                          className={`${getChipSeverityClasses(incident.severity)} min-w-[85px] justify-center ${
                            isCriticalOpen ? "animate-blink-chip" : ""
                          }`}
                        >
                          {incident.severity}
                        </Chip>
                        {isCriticalOpen && (
                          <div className="absolute left-[calc(50%+1.5rem)] top-1/2 -translate-y-1/2 w-10 h-10 flex-shrink-0">
                            <Lottie
                              animationData={warningAnimation}
                              loop={true}
                              autoplay={true}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{incident.category}</TableCell>
                    <TableCell>{incident.source}</TableCell>
                    <TableCell>{formatTimestamp(incident.timestamp)}</TableCell>
                    <TableCell className="!pl-0">
                      <div className="flex justify-start">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              variant="solid"
                              color={getStatusColor(currentStatus)}
                              size="sm"
                              className="text-white min-w-[100px] pl-0 pr-0"
                            >
                              {currentStatus}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Status actions"
                            onAction={(key) =>
                              handleStatusChange(incident.id, key as string)
                            }
                            selectedKeys={[currentStatus]}
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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
      </CardBody>
    </Card>
  );
};

export default DashboardTable;
