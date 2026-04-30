// utils/formatDate.ts

/**
 * Formats an ISO date string to a readable IST format.
 * Example: "17 Apr 2026, 01:15 PM"
 */
export const formatIST = (isoString: string): string => {
  return new Date(isoString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
