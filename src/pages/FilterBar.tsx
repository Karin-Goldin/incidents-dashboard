import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import {
  useAppDispatch,
  useAppSelector,
  setFilters,
  setSearchIp,
  setSortBy,
  setSortOrder,
  setTimeRange,
  clearFilters,
  type FilterState,
} from "@/store";

const FilterBar = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const incidents = useAppSelector((state) => state.incidents.incidents);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState<FilterState>(filters);

  // Initialize filters from URL params
  useEffect(() => {
    const severities =
      searchParams.get("severity")?.split(",").filter(Boolean) || [];
    const statuses =
      searchParams.get("status")?.split(",").filter(Boolean) || [];
    const categories =
      searchParams.get("category")?.split(",").filter(Boolean) || [];
    const searchIp = searchParams.get("searchIp") || "";
    const sortBy =
      (searchParams.get("sortBy") as "timestamp" | "severity") || "";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const timeRange =
      (searchParams.get("timeRange") as "all" | "24h" | "7d" | "30d") || "all";

    dispatch(
      setFilters({
        severities,
        statuses,
        categories,
        searchIp,
        sortBy,
        sortOrder,
        timeRange,
      })
    );
  }, [searchParams, dispatch]);

  // Update URL params when filters change
  const updateUrlParams = (newFilters: FilterState) => {
    const params = new URLSearchParams();

    if (newFilters.severities.length > 0) {
      params.set("severity", newFilters.severities.join(","));
    }
    if (newFilters.statuses.length > 0) {
      params.set("status", newFilters.statuses.join(","));
    }
    if (newFilters.categories.length > 0) {
      params.set("category", newFilters.categories.join(","));
    }
    if (newFilters.searchIp) {
      params.set("searchIp", newFilters.searchIp);
    }
    if (newFilters.sortBy) {
      params.set("sortBy", newFilters.sortBy);
      params.set("sortOrder", newFilters.sortOrder);
    }
    if (newFilters.timeRange && newFilters.timeRange !== "all") {
      params.set("timeRange", newFilters.timeRange);
    }

    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    if (isModalOpen) {
      setModalFilters(filters);
    }
  }, [isModalOpen, filters]);

  const toggleSeverity = (severity: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newSeverities = modalFilters.severities.includes(severity)
      ? modalFilters.severities.filter((s) => s !== severity)
      : [...modalFilters.severities, severity];

    setModalFilters({ ...modalFilters, severities: newSeverities });
  };

  const toggleStatus = (status: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newStatuses = modalFilters.statuses.includes(status)
      ? modalFilters.statuses.filter((s) => s !== status)
      : [...modalFilters.statuses, status];

    setModalFilters({ ...modalFilters, statuses: newStatuses });
  };

  const toggleCategory = (category: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newCategories = modalFilters.categories.includes(category)
      ? modalFilters.categories.filter((c) => c !== category)
      : [...modalFilters.categories, category];

    setModalFilters({ ...modalFilters, categories: newCategories });
  };

  const applyFilters = () => {
    dispatch(setFilters(modalFilters));
    updateUrlParams(modalFilters);
    setIsModalOpen(false);
  };

  const handleSearchIpChange = (value: string) => {
    dispatch(setSearchIp(value));
    const newFilters = { ...filters, searchIp: value };
    updateUrlParams(newFilters);
  };

  const handleSortChange = (sortBy: "timestamp" | "severity") => {
    const newSortOrder: "asc" | "desc" =
      filters.sortBy === sortBy && filters.sortOrder === "desc"
        ? "asc"
        : "desc";
    dispatch(setSortBy(sortBy));
    dispatch(setSortOrder(newSortOrder));
    const newFilters = { ...filters, sortBy, sortOrder: newSortOrder };
    updateUrlParams(newFilters);
  };

  const handleTimeRangeChange = (timeRange: "all" | "24h" | "7d" | "30d") => {
    dispatch(setTimeRange(timeRange));
    const newFilters = { ...filters, timeRange };
    updateUrlParams(newFilters);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchParams({}, { replace: true });
  };

  const uniqueCategories = Array.from(
    new Set(incidents.map((item) => item.category))
  );

  const severityOptions = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const statusOptions = ["OPEN", "ESCALATED", "RESOLVED"];

  const activeFilterCount =
    filters.severities.length +
    filters.statuses.length +
    filters.categories.length +
    (filters.searchIp ? 1 : 0) +
    (filters.sortBy ? 1 : 0) +
    (filters.timeRange !== "all" ? 1 : 0);

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          color="primary"
          variant="flat"
          onPress={() => {
            setIsModalOpen(!isModalOpen);
            if (!isModalOpen) {
              setModalFilters(filters);
            }
          }}
          className="relative"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] flex items-center justify-center bg-red-600 text-white font-bold text-[11px] rounded-full shadow-md z-10 px-1 leading-none">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <Input
          placeholder="Search by IP address"
          value={filters.searchIp}
          onValueChange={handleSearchIpChange}
          className="max-w-xs"
          size="sm"
        />

        <Dropdown>
          <DropdownTrigger>
            <Button variant="flat" size="sm">
              Sort: {filters.sortBy || "None"}
              {filters.sortBy && ` (${filters.sortOrder.toUpperCase()})`}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Sort options"
            onAction={(key) =>
              handleSortChange(key as "timestamp" | "severity")
            }
            selectedKeys={filters.sortBy ? [filters.sortBy] : []}
            selectionMode="single"
          >
            <DropdownItem key="timestamp">Timestamp</DropdownItem>
            <DropdownItem key="severity">Severity</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <div className="ml-2 flex items-center gap-4">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                endContent={
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                {filters.timeRange === "all"
                  ? "All time"
                  : filters.timeRange === "24h"
                    ? "Last 24 hours"
                    : filters.timeRange === "7d"
                      ? "Last 7 days"
                      : "Last month"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Time range options"
              onAction={(key) =>
                handleTimeRangeChange(key as "all" | "24h" | "7d" | "30d")
              }
              selectedKeys={[filters.timeRange]}
              selectionMode="single"
            >
              <DropdownItem key="all">All time</DropdownItem>
              <DropdownItem key="24h">Last 24 hours</DropdownItem>
              <DropdownItem key="7d">Last 7 days</DropdownItem>
              <DropdownItem key="30d">Last month</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {activeFilterCount > 0 && (
            <Button
              variant="light"
              size="sm"
              onPress={handleClearFilters}
              className="text-danger"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsModalOpen(false);
            setModalFilters(filters); // Reset modal filters when closing without applying
          }}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-bold">Filter Incidents</h3>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => {
                  setIsModalOpen(false);
                  setModalFilters(filters); // Reset modal filters when closing without applying
                }}
                aria-label="Close"
              >
                ×
              </Button>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Severity Filter */}
              <div>
                <h4 className="font-semibold mb-3">Severity</h4>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((severity) => {
                    const isSelected =
                      modalFilters.severities.includes(severity);
                    return (
                      <div
                        key={severity}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSeverity(severity, e);
                        }}
                        className="cursor-pointer"
                      >
                        <Chip
                          color={
                            severity === "CRITICAL"
                              ? "danger"
                              : severity === "HIGH"
                                ? "warning"
                                : severity === "MEDIUM"
                                  ? "primary"
                                  : "success"
                          }
                          variant={isSelected ? "solid" : "flat"}
                        >
                          {severity}
                        </Chip>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h4 className="font-semibold mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => {
                    const isSelected = modalFilters.statuses.includes(status);
                    return (
                      <div
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(status, e);
                        }}
                        className="cursor-pointer"
                      >
                        <Chip
                          color={
                            status === "OPEN"
                              ? "primary"
                              : status === "ESCALATED"
                                ? "warning"
                                : "success"
                          }
                          variant={isSelected ? "solid" : "flat"}
                        >
                          {status}
                        </Chip>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map((category) => {
                    const isSelected =
                      modalFilters.categories.includes(category);
                    return (
                      <div
                        key={category}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category, e);
                        }}
                        className="cursor-pointer"
                      >
                        <Chip
                          variant={isSelected ? "solid" : "flat"}
                          color={isSelected ? "primary" : "default"}
                        >
                          {category}
                        </Chip>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="light"
                  onPress={() => {
                    const emptyFilters: FilterState = {
                      severities: [],
                      statuses: [],
                      categories: [],
                      searchIp: "",
                      sortBy: "",
                      sortOrder: "desc",
                      timeRange: "all",
                    };
                    setModalFilters(emptyFilters);
                  }}
                  className="text-danger"
                >
                  Clear All
                </Button>
                <Button color="primary" onPress={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
