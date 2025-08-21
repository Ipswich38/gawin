import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function for contrast classes used in calculator
export function getContrastClass(isDark: boolean = false) {
  return isDark 
    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
    : 'bg-gray-100 hover:bg-gray-200 text-gray-900';
}