import { Select as ChakraSelect, createListCollection } from "@chakra-ui/react"
import * as React from "react"

// Type-safe event interface for react-hook-form compatibility
interface SelectChangeEvent {
  target: {
    value: string
    name: string
  }
}

// Type-safe blur event interface compatible with react-hook-form
type SelectBlurEvent = { target: any; type?: any }

export interface SelectProps
  extends Omit<
    ChakraSelect.RootProps,
    "collection" | "value" | "onValueChange" | "onInteractOutside" | "onChange"
  > {
  placeholder?: string
  children?: React.ReactNode
  value?: string
  // Use proper event types for react-hook-form compatibility
  onChange?: (event: SelectChangeEvent) => void
  onBlur?: (event: SelectBlurEvent) => void
  name?: string
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  function Select(props, ref) {
    const { placeholder, children, value, onChange, onBlur, name, ...rest } =
      props

    // Extract options from children
    const options = React.useMemo(() => {
      const optionElements = React.Children.toArray(children)
      return optionElements
        .filter(
          (child): child is React.ReactElement =>
            React.isValidElement(child) && child.type === "option",
        )
        .map((option) => ({
          label: option.props.children,
          value: option.props.value,
        }))
    }, [children])

    const collection = createListCollection({ items: options })

    const handleValueChange = React.useCallback(
      (details: { value: string[] }) => {
        if (onChange) {
          // Simulate native select event for react-hook-form compatibility
          const event = {
            target: {
              value: details.value[0] || "",
              name: name || "",
            },
          }
          onChange(event)
        }
        // Trigger onBlur to ensure validation runs
        if (onBlur) {
          const blurEvent: SelectChangeEvent = {
            target: { value: details.value[0] || "", name: name || "" }
          }
          onBlur(blurEvent)
        }
      },
      [onChange, onBlur, name],
    )

    return (
      <ChakraSelect.Root
        collection={collection}
        ref={ref}
        value={value ? [value] : []}
        onValueChange={handleValueChange}
        onInteractOutside={(event) => {
          if (onBlur) {
            onBlur(event as SelectBlurEvent)
          }
        }}
        name={name}
        {...rest}
      >
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText placeholder={placeholder} />
          <ChakraSelect.Indicator />
        </ChakraSelect.Trigger>
        <ChakraSelect.Content>
          {options.map((item) => (
            <ChakraSelect.Item item={item} key={item.value}>
              <ChakraSelect.ItemText>{item.label}</ChakraSelect.ItemText>
              <ChakraSelect.ItemIndicator />
            </ChakraSelect.Item>
          ))}
        </ChakraSelect.Content>
      </ChakraSelect.Root>
    )
  },
)

// Export the compound components for advanced usage
export const SelectRoot = ChakraSelect.Root
export const SelectTrigger = ChakraSelect.Trigger
export const SelectValueText = ChakraSelect.ValueText
export const SelectIndicator = ChakraSelect.Indicator
export const SelectContent = ChakraSelect.Content
export const SelectItem = ChakraSelect.Item
export const SelectItemText = ChakraSelect.ItemText
export const SelectItemIndicator = ChakraSelect.ItemIndicator
