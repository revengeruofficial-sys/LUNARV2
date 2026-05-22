import { formatDistanceToNow } from "date-fns";

export function shortId(id: string | null | undefined): string {
  if (!id) return "Unknown";
  if (id.length <= 6) return id;
  return `${id.slice(0, 6)}...`;
}

export function formatTimeAgo(timestamp: number | string): string {
  if (!timestamp) return "Never";
  try {
    const date = new Date(Number(timestamp));
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Invalid Date";
  }
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
