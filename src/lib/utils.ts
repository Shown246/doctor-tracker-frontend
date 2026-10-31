import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function title(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (v) => v.toUpperCase());
}
export function dateTime(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Dhaka',
      }).format(new Date(value))
    : 'No update recorded';
}
export function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
