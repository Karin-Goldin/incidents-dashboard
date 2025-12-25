import { Chip } from "@heroui/chip";
import { useState, useEffect } from "react";

interface HeaderProps {
  title?: string;
  // Optional: Allow parent to control connection status
  status?: "connected" | "reconnecting" | "disconnected";
  onStatusChange?: (
    status: "connected" | "reconnecting" | "disconnected"
  ) => void;
}

const Header = ({
  title = "Security Operations Center - Incident Dashboard",
  status: externalStatus,
  onStatusChange,
}: HeaderProps) => {
  // Helper function to get HeroUI theme colors
  const getThemeColor = (
    colorName: "success" | "warning" | "danger"
  ): string => {
    const tempEl = document.createElement("div");
    const colorClassMap: Record<string, string> = {
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
    };

    tempEl.className = colorClassMap[colorName] || "text-success";
    tempEl.style.position = "absolute";
    tempEl.style.visibility = "hidden";
    document.body.appendChild(tempEl);

    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    return computedColor;
  };

  // Connection status state
  const [internalStatus, setInternalStatus] = useState<
    "connected" | "reconnecting" | "disconnected"
  >("connected");
  const [lastUpdate, setLastUpdate] = useState(0);
  const [latency, setLatency] = useState(45);

  // Use external status if provided, otherwise use internal
  const connectionStatus = externalStatus || internalStatus;

  // Simulate connection monitoring and updates
  useEffect(() => {
    const updateTimer = setInterval(() => {
      setLastUpdate((prev) => prev + 1);
    }, 1000);

    // Simulate occasional reconnection (for demo purposes)
    // Remove this in production and use real connection monitoring
    const statusCheck = setInterval(() => {
      const random = Math.random();
      if (random > 0.95) {
        const newStatus = "reconnecting";
        setInternalStatus(newStatus);
        onStatusChange?.(newStatus);

        setTimeout(() => {
          setInternalStatus("connected");
          onStatusChange?.("connected");
        }, 2000);
      }
      setLatency(Math.floor(Math.random() * 30) + 30);
    }, 10000);

    return () => {
      clearInterval(updateTimer);
      clearInterval(statusCheck);
    };
  }, [onStatusChange]);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          color: getThemeColor("success"),
          bgColor: "bg-success-50",
          textColor: "text-success-700",
          label: "Live",
        };
      case "reconnecting":
        return {
          color: getThemeColor("warning"),
          bgColor: "bg-warning-50",
          textColor: "text-warning-700",
          label: "Reconnecting",
        };
      case "disconnected":
        return {
          color: getThemeColor("danger"),
          bgColor: "bg-danger-50",
          textColor: "text-danger-700",
          label: "Disconnected",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      className={`${statusConfig.bgColor} border-b border-default-200 backdrop-blur-md transition-all duration-500`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: statusConfig.color }}
                />
                {connectionStatus === "connected" && (
                  <div
                    className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping"
                    style={{
                      backgroundColor: statusConfig.color,
                      opacity: 0.6,
                    }}
                  />
                )}
              </div>
              <span className={`font-semibold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="h-4 w-px bg-default-300" />

            <h1 className="font-bold text-lg text-foreground-700">{title}</h1>
          </div>

          {/* Right: Update Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-default-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Last update:{" "}
                <strong className="text-foreground">{lastUpdate}s ago</strong>
              </span>
            </div>

            {connectionStatus === "connected" && (
              <>
                <div className="h-4 w-px bg-default-300" />

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className="w-1 rounded-full bg-success-500 transition-all"
                        style={{
                          height: `${bar * 4 + 4}px`,
                          opacity: latency < bar * 30 ? 1 : 0.3,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-default-500">{latency}ms</span>
                </div>
              </>
            )}

            <Chip
              size="sm"
              variant="flat"
              color={
                connectionStatus === "connected"
                  ? "success"
                  : connectionStatus === "reconnecting"
                    ? "warning"
                    : "danger"
              }
              className="font-medium"
            >
              {connectionStatus === "connected"
                ? "Real-time Active"
                : connectionStatus === "reconnecting"
                  ? "Connecting..."
                  : "Offline Mode"}
            </Chip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
