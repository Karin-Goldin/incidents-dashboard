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
import { mockdata } from "@/mockdata";

type FilterState = {
  severities: string[];
  statuses: string[];
  categories: string[];
  searchIp: string;
  sortBy: "timestamp" | "severity" | "";
  sortOrder: "asc" | "desc";
  timeRange: "all" | "24h" | "7d" | "30d";
};

const FilterBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    severities: [],
    statuses: [],
    categories: [],
    searchIp: "",
    sortBy: "",
    sortOrder: "desc",
    timeRange: "all",
  });

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

    setFilters({
      severities,
      statuses,
      categories,
      searchIp,
      sortBy,
      sortOrder,
      timeRange,
    });
  }, [searchParams]);

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

  const toggleSeverity = (severity: string) => {
    const newSeverities = filters.severities.includes(severity)
      ? filters.severities.filter((s) => s !== severity)
      : [...filters.severities, severity];

    const newFilters = { ...filters, severities: newSeverities };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];

    const newFilters = { ...filters, statuses: newStatuses };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handleSearchIpChange = (value: string) => {
    const newFilters = { ...filters, searchIp: value };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handleSortChange = (sortBy: "timestamp" | "severity") => {
    const newSortOrder: "asc" | "desc" =
      filters.sortBy === sortBy && filters.sortOrder === "desc"
        ? "asc"
        : "desc";
    const newFilters = { ...filters, sortBy, sortOrder: newSortOrder };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handleTimeRangeChange = (timeRange: "all" | "24h" | "7d" | "30d") => {
    const newFilters = { ...filters, timeRange };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      severities: [],
      statuses: [],
      categories: [],
      searchIp: "",
      sortBy: "",
      sortOrder: "desc",
      timeRange: "all",
    };
    setFilters(emptyFilters);
    setSearchParams({}, { replace: true });
  };

  // Get unique categories from mockdata
  const uniqueCategories = Array.from(
    new Set(mockdata.map((item) => item.category))
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
          onPress={() => setIsModalOpen(!isModalOpen)}
          className="relative"
        >
          Filters
          {activeFilterCount > 0 && (
            <Chip
              size="sm"
              color="danger"
              className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center"
            >
              {activeFilterCount}
            </Chip>
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
              onPress={clearFilters}
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
          onClick={() => setIsModalOpen(false)}
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
                onPress={() => setIsModalOpen(false)}
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
                    const isSelected = filters.severities.includes(severity);
                    return (
                      <Chip
                        key={severity}
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
                        className="cursor-pointer"
                        onClick={() => toggleSeverity(severity)}
                      >
                        {severity}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h4 className="font-semibold mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => {
                    const isSelected = filters.statuses.includes(status);
                    return (
                      <Chip
                        key={status}
                        color={
                          status === "OPEN"
                            ? "primary"
                            : status === "ESCALATED"
                              ? "warning"
                              : "success"
                        }
                        variant={isSelected ? "solid" : "flat"}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(status)}
                      >
                        {status}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map((category) => {
                    const isSelected = filters.categories.includes(category);
                    return (
                      <Chip
                        key={category}
                        variant={isSelected ? "solid" : "flat"}
                        color={isSelected ? "primary" : "default"}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="light"
                  onPress={clearFilters}
                  className="text-danger"
                >
                  Clear All
                </Button>
                <Button color="primary" onPress={() => setIsModalOpen(false)}>
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
export type { FilterState };
