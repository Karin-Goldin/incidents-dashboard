/**
 * Helper functions for working with theme colors and severity/status mappings
 */

export const getThemeColor = (colorName: string): string => {
  const tempEl = document.createElement("div");
  const colorClassMap: Record<string, string> = {
    primary: "text-primary",
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
  };

  tempEl.className = colorClassMap[colorName] || "text-primary";
  tempEl.style.position = "absolute";
  tempEl.style.visibility = "hidden";
  document.body.appendChild(tempEl);

  const computedColor = getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  return computedColor;
};

export const getChipSeverityColor = (
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

export const getChipSeverityClasses = (severity: string): string => {
  const classMap: Record<string, string> = {
    CRITICAL: "bg-danger-50 text-danger",
    HIGH: "bg-warning-50 text-warning",
    MEDIUM: "bg-primary-50 text-primary",
    LOW: "bg-success-50 text-success",
  };
  return classMap[severity] || "";
};

export const getStatusColor = (
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
