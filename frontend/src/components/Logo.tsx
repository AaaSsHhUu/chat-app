import { LuMessageCircle } from "react-icons/lu";

interface PeerChatLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export default function PeerChatLogo({ size = "md", showText = true, className = "" }: PeerChatLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1.5 shadow-lg transition-transform hover:scale-110`}
        >
          <LuMessageCircle className="h-full w-full text-white" />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white animate-pulse"></div>
      </div>

      {showText && (
        <span
          className={`font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}
        >
          PeerChat
        </span>
      )}
    </div>
  )
}
