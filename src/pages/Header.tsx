import { Chip } from "@heroui/chip";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/store";
import { getThemeColor } from "@/utils/themeHelpers";
import ThemeSwitch from "@/components/ThemeSwitch";

interface HeaderProps {
  title?: string;
  // Optional: Allow parent to control connection status
  status?: "connected" | "reconnecting" | "disconnected";
}

const Header = ({
  title = "Security Operations Center - Incident Dashboard",
  status: externalStatus,
}: HeaderProps) => {
  // Connection status state (fallback אם לא נשלח מ-props)
  const [internalStatus] = useState<
    "connected" | "reconnecting" | "disconnected"
  >("connected");

  // קבלת lastUpdate מ-Redux (timestamp של העדכון האחרון)
  const lastUpdateTimestamp = useAppSelector(
    (state) => state.connection.lastUpdate
  );
  // חישוב כמה שניות עברו מאז העדכון האחרון ט
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  // Use external status if provided, otherwise use internal
  const connectionStatus = externalStatus || internalStatus;

  // עדכון המונה כל שנייה - מחשב כמה זמן עבר מאז העדכון האחרון
  useEffect(() => {
    const updateTimer = setInterval(() => {
      if (lastUpdateTimestamp > 0) {
        const now = Date.now();
        const seconds = Math.floor((now - lastUpdateTimestamp) / 1000);
        setSecondsSinceUpdate(seconds);
      } else {
        setSecondsSinceUpdate(0);
      }
    }, 1000);

    // עדכון מיידי כשמגיע lastUpdateTimestamp חדש
    if (lastUpdateTimestamp > 0) {
      const now = Date.now();
      const seconds = Math.floor((now - lastUpdateTimestamp) / 1000);
      setSecondsSinceUpdate(seconds);
    }

    return () => {
      clearInterval(updateTimer);
    };
  }, [lastUpdateTimestamp]);

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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          {/* Left: Status */}
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
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
              <span
                className={`font-semibold text-sm md:text-base ${statusConfig.textColor}`}
              >
                {statusConfig.label}
              </span>
            </div>

            <div className="hidden md:block h-4 w-px bg-default-300" />

            <h1 className="font-bold text-base md:text-lg text-foreground-700">
              <span className="hidden lg:inline">{title}</span>
              <span className="lg:hidden">SOC Dashboard</span>
            </h1>
          </div>

          {/* Right: Update Info */}
          <div className="flex items-center gap-3 md:gap-6 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 text-sm text-default-600">
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
                <strong className="text-foreground">
                  {secondsSinceUpdate}s ago
                </strong>
              </span>
            </div>

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
              className="font-medium text-xs md:text-sm"
            >
              <span className="hidden md:inline">
                {connectionStatus === "connected"
                  ? "Real-time Active"
                  : connectionStatus === "reconnecting"
                    ? "Connecting..."
                    : "Offline Mode"}
              </span>
              <span className="md:hidden">
                {connectionStatus === "connected"
                  ? "Active"
                  : connectionStatus === "reconnecting"
                    ? "Connecting"
                    : "Offline"}
              </span>
            </Chip>

            <div className="hidden md:block h-4 w-px bg-default-300" />

            <ThemeSwitch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
