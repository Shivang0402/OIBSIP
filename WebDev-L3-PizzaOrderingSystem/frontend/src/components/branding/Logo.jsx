function LogoIcon() {
  return (
    <svg
      className="logo__icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#F97316" />
      <path d="M14 32 L24 14 L34 32 Z" fill="#FFF7ED" opacity="0.95" />
      <path d="M24 14 L28 24 L20 24 Z" fill="#DC2626" />
      <path
        d="M18 28 Q24 22 30 28"
        stroke="#1F2937"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="10" r="3" fill="#FBBF24" />
    </svg>
  );
}

function Logo({ variant = 'full' }) {
  if (variant === 'icon') {
    return (
      <div className="logo logo--icon">
        <LogoIcon />
      </div>
    );
  }

  return (
    <div className="logo logo--full">
      <LogoIcon />
      <span className="logo__wordmark">PizzaNova</span>
    </div>
  );
}

export default Logo;
