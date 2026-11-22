import { cn } from '../../utils/cn.js'

export function BrandLogo({ className = 'h-8 w-8' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="var(--accent-primary)" />
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="11"
        stroke="#FDE68A"
        strokeOpacity="0.38"
        strokeWidth="1.5"
      />
      <path
        d="M20 20H44V26H27V31H40V37H27V46H20V20Z"
        fill="#FCFBF9"
      />
      <path
        d="M41 39L44 42L50 35"
        stroke="#FDE68A"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
