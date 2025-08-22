import { Tooltip as ChakraTooltip } from "@chakra-ui/react"
import * as React from "react"

export interface TooltipProps extends ChakraTooltip.RootProps {
  label: React.ReactNode
  children: React.ReactNode
  showArrow?: boolean
  placement?: ChakraTooltip.RootProps["positioning"]
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const { label, children, showArrow = true, placement, ...rest } = props
    
    return (
      <ChakraTooltip.Root positioning={placement} {...rest}>
        <ChakraTooltip.Trigger asChild>
          {children}
        </ChakraTooltip.Trigger>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content ref={ref}>
            {showArrow && <ChakraTooltip.Arrow />}
            {label}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </ChakraTooltip.Root>
    )
  },
)

Tooltip.displayName = "Tooltip"