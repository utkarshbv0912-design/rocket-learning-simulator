import { motion } from "framer-motion";

export default function RocketIcon({ size = 64, animate = true }) {
  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? {
        animate: { y: [0, -8, 0] },
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }
    : {};

  return (
    <Wrapper {...wrapperProps} className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flame */}
        <ellipse cx="32" cy="58" rx="6" ry="5" fill="#F59E0B" opacity="0.8" />
        <ellipse cx="32" cy="56" rx="4" ry="4" fill="#EF4444" opacity="0.9" />
        <ellipse cx="32" cy="54" rx="2.5" ry="3" fill="#FBBF24" />

        {/* Body */}
        <path
          d="M26 48 L26 24 Q32 6 38 24 L38 48 Z"
          fill="url(#rocketBody)"
          stroke="hsl(262 83% 58%)"
          strokeWidth="0.5"
        />

        {/* Window */}
        <circle cx="32" cy="28" r="4" fill="#0EA5E9" stroke="#38BDF8" strokeWidth="1" />
        <circle cx="31" cy="27" r="1.5" fill="white" opacity="0.4" />

        {/* Fins */}
        <path d="M26 44 L18 52 L26 48 Z" fill="hsl(262 83% 58%)" />
        <path d="M38 44 L46 52 L38 48 Z" fill="hsl(262 83% 58%)" />

        {/* Nose tip */}
        <circle cx="32" cy="15" r="1.5" fill="#EF4444" />

        <defs>
          <linearGradient id="rocketBody" x1="26" y1="48" x2="38" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#94A3B8" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>
      </svg>
    </Wrapper>
  );
}
