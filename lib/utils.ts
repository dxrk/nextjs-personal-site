import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const metersToMiles = (meters: number) => {
  return (meters / 1609.34).toFixed(1);
};

export const secondsToHours = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const secondsToMinutes = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const formatPace = (pace: number) => {
  const milePace = (1 / pace) * 26.8224;
  const minutes = Math.floor(milePace);
  const secs = Math.ceil((milePace % minutes) * 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};
