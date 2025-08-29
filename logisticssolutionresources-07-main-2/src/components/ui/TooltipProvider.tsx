
import { TooltipProvider as RadixTooltipProvider } from "@radix-ui/react-tooltip"
import { ReactNode } from "react"

interface TooltipProviderProps {
  children: ReactNode
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return (
    <RadixTooltipProvider delayDuration={200}>
      {children}
    </RadixTooltipProvider>
  )
}

export default TooltipProvider
