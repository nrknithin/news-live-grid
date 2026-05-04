const BASE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export default function Icon({ name, size = 18, ...rest }) {
  const props = { ...BASE, width: size, height: size, viewBox: '0 0 24 24', ...rest };
  switch (name) {
    case 'menu':
      return (
        <svg {...props}>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      );
    case 'close':
      return (
        <svg {...props}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case 'speaker':
      return (
        <svg {...props}>
          <path d="M5 9h3l4-3v12l-4-3H5z" />
          <path d="M16 8a5 5 0 0 1 0 8" />
          <path d="M19 5a9 9 0 0 1 0 14" opacity="0.6" />
        </svg>
      );
    case 'speaker-off':
      return (
        <svg {...props}>
          <path d="M5 9h3l4-3v12l-4-3H5z" />
          <line x1="16" y1="9" x2="22" y2="15" />
          <line x1="22" y1="9" x2="16" y2="15" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...props}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'eye-off':
      return (
        <svg {...props}>
          <path d="M3 3l18 18" />
          <path d="M10.5 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.2 4" />
          <path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 6 10 6c1.7 0 3.2-.4 4.5-1" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'tv':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M8 3l4 3 4-3" />
        </svg>
      );
    case 'expand':
      return (
        <svg {...props}>
          <polyline points="4 9 4 4 9 4" />
          <polyline points="20 9 20 4 15 4" />
          <polyline points="4 15 4 20 9 20" />
          <polyline points="20 15 20 20 15 20" />
        </svg>
      );
    case 'collapse':
      return (
        <svg {...props}>
          <polyline points="9 4 4 4 4 9" />
          <polyline points="15 4 20 4 20 9" />
          <polyline points="9 20 4 20 4 15" />
          <polyline points="15 20 20 20 20 15" />
        </svg>
      );
    default:
      return null;
  }
}
