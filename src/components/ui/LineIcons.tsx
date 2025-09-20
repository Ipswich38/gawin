/**
 * Beautiful Simple Line Icons Component
 * Aesthetic minimalist icons to replace emoji icons throughout the app
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const ChatIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16,18 22,12 16,6"/>
    <polyline points="8,6 2,12 8,18"/>
  </svg>
);

export const QuizIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M9,9h6v6H9z"/>
    <path d="M9,1v6"/>
    <path d="M15,1v6"/>
    <path d="M9,17v6"/>
    <path d="M15,17v6"/>
    <path d="M1,9h6"/>
    <path d="M17,9h6"/>
    <path d="M1,15h6"/>
    <path d="M17,15h6"/>
  </svg>
);

export const StudyIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17,21v-2a4,4 0,0 0-4-4H5a4,4 0,0 0-4,4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23,21v-2a4,4 0,0 0-3-3.87"/>
    <path d="M16,3.13a4,4 0,0 1 0,7.75"/>
  </svg>
);

export const CreativeIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12,2l3.09,6.26L22,9.27l-5,4.87L18.18,21,12,17.77,5.82,21,7,14.14,2,9.27l6.91-1.01L12,2Z"/>
  </svg>
);

export const BrowserIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 16, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5,15H4a2,2 0,0 1-2-2V4A2,2 0,0 1 4,2H13a2,2 0,0 1 2,2V5"/>
  </svg>
);

export const ThumbsUpIcon: React.FC<IconProps> = ({ size = 16, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14,9V5a3,3 0,0 0-3-3l-4,9v11h11.28a2,2 0,0 0 2-1.7l1.38-9a2,2 0,0 0-2-2.3zM7,22H4a2,2 0,0 1-2-2V13a2,2 0,0 1 2-2H7"/>
  </svg>
);

export const ThumbsDownIcon: React.FC<IconProps> = ({ size = 16, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10,15v4a3,3 0,0 0 3,3l4-9V2H6.72a2,2 0,0 0-2,1.7L3.34,13a2,2 0,0 0 2,2.3zM17,2H20a2,2 0,0 1 2,2V11a2,2 0,0 1-2,2H17"/>
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const LoadingIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={`${className} animate-spin`}>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/>
    <path d="M21,21l-4.35-4.35"/>
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23,4 23,10 17,10"/>
    <polyline points="1,20 1,14 7,14"/>
    <path d="M20.49,9A9,9 0,0 0 5.64,5.64L1,10M23,14l-4.64,4.36A9,9 0,0 1 3.51,15"/>
  </svg>
);

export const BackIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12,19 5,12 12,5"/>
  </svg>
);

export const ForwardIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </svg>
);

export const WriteIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11,4H4A2,2 0,0 0 2,6V20a2,2 0,0 0 2,2H16a2,2 0,0 0 2-2V13"/>
    <path d="M18.5,2.5a2.121,2.121 0,0 1 3,3L12,15l-4,1,1-4Z"/>
  </svg>
);

export const PermissionsIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7,11V7a5,5 0,0 1 10,0v4"/>
  </svg>
);

export const VoiceModeIcon: React.FC<IconProps> = ({ size = 20, className = "", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
    <circle cx="12" cy="12" r="3" opacity="0.3"/>
  </svg>
);