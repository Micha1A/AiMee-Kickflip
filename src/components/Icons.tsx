import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

const defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Lock = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Unlock = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export const Settings = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const FileText = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export const Activity = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const Cpu = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <rect width="16" height="16" x="4" y="4" rx="2" ry="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" ry="1" />
    <path d="M15 2v2" />
    <path d="M15 20v2" />
    <path d="M2 15h2" />
    <path d="M2 9h2" />
    <path d="M20 15h2" />
    <path d="M20 9h2" />
    <path d="M9 2v2" />
    <path d="M9 20v2" />
  </svg>
);

export const Zap = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

export const Terminal = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

export const X = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const Plus = ({ size = 24, className = "", ...props }: IconProps) => (
  <svg {...defaultProps} width={size} height={size} className={className} {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);