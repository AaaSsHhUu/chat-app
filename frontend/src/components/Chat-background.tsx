interface ChatBackgroundProps {
  className?: string
}

export function ChatBackground({ className = "" }: ChatBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Base background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" />

      {/* Main creative pattern overlay - Light mode */}
      <div className="absolute inset-0 opacity-60 dark:hidden">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="creative-pattern-light" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              {/* Light mode pattern */}
              <circle cx="8" cy="12" r="1.5" fill="rgb(156, 163, 175)" opacity="0.4" />
              <circle cx="25" cy="7" r="0.8" fill="rgb(99, 102, 241)" opacity="0.3" />
              <circle cx="35" cy="25" r="1.2" fill="rgb(156, 163, 175)" opacity="0.35" />
              <circle cx="15" cy="30" r="0.6" fill="rgb(139, 92, 246)" opacity="0.25" />
              <circle cx="32" cy="15" r="0.4" fill="rgb(156, 163, 175)" opacity="0.3" />

              {/* Random polygons */}
              <polygon points="5,5 7,3 9,5 7,7" fill="rgb(99, 102, 241)" opacity="0.2" />
              <polygon points="28,28 30,26 32,28 30,30" fill="rgb(139, 92, 246)" opacity="0.15" />
              <polygon points="18,8 20,6 22,8 20,10" fill="rgb(156, 163, 175)" opacity="0.25" />

              {/* Random lines */}
              <line x1="12" y1="20" x2="18" y2="22" stroke="rgb(156, 163, 175)" strokeWidth="0.3" opacity="0.3" />
              <line x1="25" y1="35" x2="30" y2="32" stroke="rgb(99, 102, 241)" strokeWidth="0.2" opacity="0.25" />
              <line x1="2" y1="25" x2="6" y2="28" stroke="rgb(139, 92, 246)" strokeWidth="0.25" opacity="0.2" />

              {/* Random dots */}
              <circle cx="22" cy="18" r="0.3" fill="rgb(156, 163, 175)" opacity="0.4" />
              <circle cx="6" cy="35" r="0.2" fill="rgb(99, 102, 241)" opacity="0.3" />
              <circle cx="38" cy="8" r="0.25" fill="rgb(139, 92, 246)" opacity="0.35" />
              <circle cx="14" cy="2" r="0.15" fill="rgb(156, 163, 175)" opacity="0.3" />
            </pattern>

            {/* Secondary pattern for more complexity */}
            <pattern id="secondary-pattern-light" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="45" cy="15" r="2" fill="rgb(99, 102, 241)" opacity="0.15" />
              <circle cx="15" cy="45" r="1.5" fill="rgb(139, 92, 246)" opacity="0.12" />
              <polygon points="30,5 35,10 30,15 25,10" fill="rgb(156, 163, 175)" opacity="0.1" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#creative-pattern-light)" />
          <rect width="100%" height="100%" fill="url(#secondary-pattern-light)" />
        </svg>
      </div>

      {/* Main creative pattern overlay - Dark mode */}
      <div className="absolute inset-0 opacity-40 hidden dark:block">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="creative-pattern-dark" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              {/* Dark mode pattern */}
              <circle cx="8" cy="12" r="1.5" fill="rgb(75, 85, 99)" opacity="0.5" />
              <circle cx="25" cy="7" r="0.8" fill="rgb(99, 102, 241)" opacity="0.4" />
              <circle cx="35" cy="25" r="1.2" fill="rgb(75, 85, 99)" opacity="0.45" />
              <circle cx="15" cy="30" r="0.6" fill="rgb(139, 92, 246)" opacity="0.35" />
              <circle cx="32" cy="15" r="0.4" fill="rgb(75, 85, 99)" opacity="0.4" />

              {/* Random polygons */}
              <polygon points="5,5 7,3 9,5 7,7" fill="rgb(99, 102, 241)" opacity="0.3" />
              <polygon points="28,28 30,26 32,28 30,30" fill="rgb(139, 92, 246)" opacity="0.25" />
              <polygon points="18,8 20,6 22,8 20,10" fill="rgb(75, 85, 99)" opacity="0.35" />

              {/* Random lines */}
              <line x1="12" y1="20" x2="18" y2="22" stroke="rgb(75, 85, 99)" strokeWidth="0.3" opacity="0.4" />
              <line x1="25" y1="35" x2="30" y2="32" stroke="rgb(99, 102, 241)" strokeWidth="0.2" opacity="0.35" />
              <line x1="2" y1="25" x2="6" y2="28" stroke="rgb(139, 92, 246)" strokeWidth="0.25" opacity="0.3" />

              {/* Random dots */}
              <circle cx="22" cy="18" r="0.3" fill="rgb(75, 85, 99)" opacity="0.5" />
              <circle cx="6" cy="35" r="0.2" fill="rgb(99, 102, 241)" opacity="0.4" />
              <circle cx="38" cy="8" r="0.25" fill="rgb(139, 92, 246)" opacity="0.45" />
              <circle cx="14" cy="2" r="0.15" fill="rgb(75, 85, 99)" opacity="0.4" />
            </pattern>

            {/* Secondary pattern for more complexity */}
            <pattern id="secondary-pattern-dark" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="45" cy="15" r="2" fill="rgb(99, 102, 241)" opacity="0.25" />
              <circle cx="15" cy="45" r="1.5" fill="rgb(139, 92, 246)" opacity="0.2" />
              <polygon points="30,5 35,10 30,15 25,10" fill="rgb(75, 85, 99)" opacity="0.18" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#creative-pattern-dark)" />
          <rect width="100%" height="100%" fill="url(#secondary-pattern-dark)" />
        </svg>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 opacity-25 dark:opacity-35">
        <div
          className="absolute top-[15%] left-[10%] w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        />
        <div
          className="absolute top-[60%] right-[15%] w-6 h-6 bg-purple-500/15 rotate-45 animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-[25%] left-[25%] w-4 h-4 bg-indigo-500/20 rounded-full animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-[35%] right-[35%] w-5 h-5 bg-violet-500/15 rotate-12 animate-pulse"
          style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
        />
        <div
          className="absolute bottom-[45%] right-[8%] w-3 h-3 bg-blue-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
        />
      </div>

      {/* Enhanced gradient overlay with more complexity */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/40 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-indigo-900/25" />

      {/* Subtle noise texture with higher opacity */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}