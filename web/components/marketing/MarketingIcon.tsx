export type MarketingIconName =
  | "assess"
  | "monitor"
  | "convert"
  | "evidence"
  | "drift"
  | "scope"
  | "velocity"
  | "briefing"
  | "roi"
  | "compare"
  | "faq"
  | "benchmark"
  | "journey"
  | "hub"
  | "learn"
  | "hndl"
  | "article"
  | "infographic";

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
    case "briefing":
      return (
        <svg {...shared}>
          <path d="M4 5h16v10H4z" />
          <path d="M9 19h6M12 15v4" />
        </svg>
      );
    case "roi":
      return (
        <svg {...shared}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 7h8" />
          <circle cx="8.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="8.5" cy="15" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="15" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "compare":
      return (
        <svg {...shared}>
          <path d="M4 20V10M10 20V4M16 20v7" />
          <path d="M2 20h20" />
        </svg>
      );
    case "faq":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.9" />
          <circle cx="12" cy="16.8" r="0.15" fill="currentColor" stroke="none" />
        </svg>
      );
    case "benchmark":
      return (
        <svg {...shared}>
          <path d="M3 9h18" strokeDasharray="1.5 2.5" />
          <rect x="5" y="12" width="3" height="7" />
          <rect x="10.5" y="7" width="3" height="12" />
          <rect x="16" y="14" width="3" height="5" />
        </svg>
      );
    case "journey":
      return (
        <svg {...shared}>
          <path d="M4 6c3 0 3 4 6 4s3-4 6-4 3 4 6 4" />
          <circle cx="20" cy="10" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="4" cy="6" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "hub":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="12" cy="4.5" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19.5" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="19.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
          <path d="M12 6.5v3M12 14.5v3M6.5 12h3M14.5 12h3" />
        </svg>
      );
    case "learn":
      return (
        <svg {...shared}>
          <path d="M12 6c-2-1.5-5-2-8-1v13c3-1 6-.5 8 1 2-1.5 5-2 8-1V5c-3-1-6-.5-8 1z" />
          <path d="M12 6v13" />
        </svg>
      );
    case "hndl":
      return (
        <svg {...shared}>
          <path d="M12 3l7 4v6c0 4.5-3.2 7.4-7 8-3.8-.6-7-3.5-7-8V7l7-4z" />
          <path d="M12 8v4l2.5 1.5" />
        </svg>
      );
    case "article":
      return (
        <svg {...shared}>
          <rect x="5" y="3" width="14" height="18" rx="1" />
          <path d="M8 7.5h8M8 11.5h8M8 15.5h5" />
        </svg>
      );
    case "infographic":
      return (
        <svg {...shared}>
          <circle cx="9" cy="9" r="5" />
          <path d="M9 4a5 5 0 0 1 5 5h-5V4z" />
          <rect x="15.5" y="13" width="2.5" height="7" />
          <rect x="19.5" y="10" width="2.5" height="10" />
        </svg>
      );
  }
}
