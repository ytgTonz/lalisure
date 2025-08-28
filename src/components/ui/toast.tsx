"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning'
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-background text-foreground border',
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200', 
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-md',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Toast.displayName = "Toast"

export { Toast }