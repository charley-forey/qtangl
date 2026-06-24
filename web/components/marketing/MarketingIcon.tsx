type MarketingIconName =
  | "assess"
  | "monitor"
  | "convert"
  | "evidence"
  | "drift"
  | "scope"
  | "velocity";

type MarketingIconProps = {
  name: MarketingIconName;
  className?: string;
};

const iconClass = "h-6 w-6 text-[var(--color-gray-300)]";

export default function MarketingIcon({ name, className = iconClass }: MarketingIconProps) {
  const shared = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "assess":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
          <path d="M7.5 7.5l1.4 1.4M15.1 15.1l1.4 1.4M16.5 7.5l-1.4 1.4M8.9 15.1l-1.4 1.4" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "monitor":
      return (
        <svg {...shared}>
          <path d="M4 18h16" />
          <rect x="3" y="5" width="18" height="11" rx="2" />
          <path d="M8 15v2M16 15v2" />
          <path d="M7 10h2M7 13h4" />
          <circle cx="16.5" cy="11.5" r="2.5" />
        </svg>
      );
    case "convert":
      return (
        <svg {...shared}>
          <path d="M4 18h16" />
          <path d="M7 14l3-3 3 3M10 11V6" />
          <path d="M17 6h-3M17 6l-2 2M17 6l-2-2" />
          <rect x="6" y="15" width="4" height="3" rx="0.5" />
          <rect x="14" y="15" width="4" height="3" rx="0.5" />
        </svg>
      );
    case "evidence":
      return (
        <svg {...shared}>
          <path d="M12 3l7 4v6c0 4.5-3.2 7.4-7 8-3.8-.6-7-3.5-7-8V7l7-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "drift":
      return (
        <svg {...shared}>
          <path d="M4 17V7l4 3 4-5 4 3 4-5v15" />
          <circle cx="8" cy="10" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="16" cy="8" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
    case "scope":
      return (
        <svg {...shared}>
          <path d="M12 3v18" />
          <path d="M5 8h14M7 16h10" />
          <circle cx="9" cy="8" r="2" />
          <circle cx="15" cy="16" r="2" />
        </svg>
      );
    case "velocity":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
          <path d="M5 5l2 2M19 5l-2 2" />
        </svg>
      );
  }
}
