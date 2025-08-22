import { Card as ChakraCard } from "@chakra-ui/react"
import { forwardRef } from "react"
import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  [key: string]: any
}

interface CardBodyProps {
  children: ReactNode
  [key: string]: any
}

interface CardHeaderProps {
  children: ReactNode
  [key: string]: any
}

interface CardFooterProps {
  children: ReactNode
  [key: string]: any
}

// Main Card component that wraps Card.Root
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraCard.Root ref={ref} {...props}>
        {children}
      </ChakraCard.Root>
    )
  },
)

Card.displayName = "Card"

// CardBody component that wraps Card.Body
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraCard.Body ref={ref} {...props}>
        {children}
      </ChakraCard.Body>
    )
  },
)

CardBody.displayName = "CardBody"

// CardHeader component that wraps Card.Header
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraCard.Header ref={ref} {...props}>
        {children}
      </ChakraCard.Header>
    )
  },
)

CardHeader.displayName = "CardHeader"

// CardFooter component that wraps Card.Footer
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraCard.Footer ref={ref} {...props}>
        {children}
      </ChakraCard.Footer>
    )
  },
)

CardFooter.displayName = "CardFooter"
