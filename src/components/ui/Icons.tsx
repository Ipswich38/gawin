import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const iconDefaults = {
  size: 20,
  color: 'currentColor',
};

// User & Account Icons
export const UserIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
);

export const EmailIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-10 5L2 7"/>
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

// Navigation Icons
export const ArrowLeftIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// Action Icons
export const CheckIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="m9 12 2 2 4-4"/>
    <path d="M21 12c-.548-1.686-2.35-3.129-4.5-3.611"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="m18 6-12 12"/>
    <path d="m6 6 12 12"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
);

// Status Icons
export const AlertCircleIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

// Settings & Menu Icons
export const SettingsIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6"/>
    <path d="M12 1v6m0 6v6"/>
    <path d="m21 12-6 0m-6 0-6 0"/>
    <path d="M21 12h-6m-6 0H3"/>
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

// AI & Tech Icons
export const BrainIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.07 2.07 0 0 1-2.44-2.44 2.07 2.07 0 0 1-1.44-2.44A2.5 2.5 0 0 1 5.5 9v-1A2.5 2.5 0 0 1 8 5.5h1.5z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.07 2.07 0 0 0 2.44-2.44 2.07 2.07 0 0 0 1.44-2.44A2.5 2.5 0 0 0 18.5 9v-1A2.5 2.5 0 0 0 16 5.5h-1.5z"/>
  </svg>
);

export const ScanIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <path d="M7 12h10"/>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

// Loading Spinner
export const LoadingSpinner: React.FC<IconProps> = ({ 
  size = iconDefaults.size, 
  color = iconDefaults.color, 
  className, 
  style 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} animate-spin`}
    style={{
      ...style,
      animation: 'spin 1s linear infinite',
    }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default {
  User: UserIcon,
  Email: EmailIcon,
  Lock: LockIcon,
  Eye: EyeIcon,
  EyeOff: EyeOffIcon,
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  ChevronDown: ChevronDownIcon,
  Check: CheckIcon,
  X: XIcon,
  Plus: PlusIcon,
  AlertCircle: AlertCircleIcon,
  Info: InfoIcon,
  Settings: SettingsIcon,
  Menu: MenuIcon,
  Brain: BrainIcon,
  Scan: ScanIcon,
  Image: ImageIcon,
  Loading: LoadingSpinner,
};