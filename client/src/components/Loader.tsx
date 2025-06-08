import { cn } from "@/lib/utils"

type LoaderType = "ai" | "user" | "default"

interface LoaderProps {
  type?: LoaderType
  className?: string
  position?: "left" | "right" | "center"
}

export const Loader = ({ 
  type = "default", 
  className,
  position = "left"
}: LoaderProps) => {
  const positionClasses = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center"
  }

  if (type === "default") {
    return (
      <div className={cn(
        "flex flex-col items-center w-full mx-auto h-screen",
        positionClasses[position],
        className
      )}>
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading, please wait...</p>
      </div>
    )
  }
  

  const loaderConfig = {
    ai: {
      classes: "bg-gradient-to-r from-blue-400 to-blue-600 h-3 w-3 mt-3",
      count: 3,
      animation: "animate-bounce"
    },
    user: {
      classes: "bg-gray-300 h-5 w-5 mt-1",
      count: 1,
      animation: "animate-spin"
    }
  }

  const config = loaderConfig[type]
  const baseClasses = "rounded-full"

  return (
    <div className={cn(
      "flex items-center gap-1 w-full",
      positionClasses[position],
      className
    )}>
      {Array.from({ length: config.count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            baseClasses,
            config.classes,
            config.animation,
            type === "ai" && `delay-${(i + 1) * 100}`,
            type === "user" && "border-2 border-gray-400 border-t-transparent"
          )}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            ...(type === "user" ? { animationDuration: "0.8s" } : {})
          }}
        />
      ))}
    </div>
  )
}
