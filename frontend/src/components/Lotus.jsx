export const LotusIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <path d="M32 8C36 16 38 22 38 28C38 34 35 38 32 40C29 38 26 34 26 28C26 22 28 16 32 8Z" fill={color} />
    <path d="M16 16C22 20 26 25 27 31C28 36 26 40 23 43C19 41 15 37 14 31C13 26 14 21 16 16Z" fill={color} opacity="0.85" />
    <path d="M48 16C42 20 38 25 37 31C36 36 38 40 41 43C45 41 49 37 50 31C51 26 50 21 48 16Z" fill={color} opacity="0.85" />
    <path d="M6 30C13 32 18 35 21 40C23 44 22 48 20 51C15 50 10 46 8 41C6 37 5 34 6 30Z" fill={color} opacity="0.7" />
    <path d="M58 30C51 32 46 35 43 40C41 44 42 48 44 51C49 50 54 46 56 41C58 37 59 34 58 30Z" fill={color} opacity="0.7" />
    <path d="M14 52C22 48 28 47 32 47C36 47 42 48 50 52C44 56 38 58 32 58C26 58 20 56 14 52Z" fill={color} />
  </svg>
);

export const LotusWatermark = ({ className = "" }) => (
  <div className={`lotus-watermark ${className}`} aria-hidden="true">
    <LotusIcon className="w-full h-full" color="#FFFFFF" />
  </div>
);
