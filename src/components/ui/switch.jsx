import React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

export function Switch({ checked, onCheckedChange, ...props }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-primary' : 'bg-secondary border border-border'
      }`}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </SwitchPrimitive.Root>
  )
}
