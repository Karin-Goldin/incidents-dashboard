/**
 * Utility functions for date and timestamp formatting
 */

/**
 * Formats a timestamp string to a human-readable date format
 * @param timestamp - ISO timestamp string (e.g., "2019-08-24T14:15:22Z")
 * @returns Formatted date string in the format "Day Mon DD YYYY HH:MM:SS"
 * @example formatTimestamp("2019-08-24T14:15:22Z") => "Sat Aug 24 2019 14:15:22"
 */
export const formatTimestamp = (timestamp: string): string => {
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

