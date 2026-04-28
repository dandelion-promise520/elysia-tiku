import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    // 使用 useCallback 优化 onChange 处理
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // 性能监控 - 只在开发环境启用
      if (process.env.NODE_ENV === 'development') {
        performance.mark(`input-change-${Date.now()}`);
      }

      onChange?.(e);
    }, [onChange]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 backdrop-blur-sm hover:bg-background/70 hover:border-input/80 focus:bg-background focus:border-ring",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
