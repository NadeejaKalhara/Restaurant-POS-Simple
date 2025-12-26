import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-slate-900 dark:bg-slate-700 text-slate-50",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50",
    outline: "border border-slate-300 dark:border-slate-600",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }





