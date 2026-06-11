import React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

export function AlertDialogContent({ children }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/60 z-50" />
      <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl">
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogHeader({ children }) {
  return <div className="mb-4">{children}</div>
}

export function AlertDialogTitle({ children }) {
  return (
    <AlertDialogPrimitive.Title className="font-heading text-lg font-semibold text-foreground mb-2">
      {children}
    </AlertDialogPrimitive.Title>
  )
}

export function AlertDialogDescription({ children }) {
  return (
    <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
      {children}
    </AlertDialogPrimitive.Description>
  )
}

export function AlertDialogFooter({ children }) {
  return <div className="flex gap-3 mt-6 justify-end">{children}</div>
}

export function AlertDialogCancel({ children }) {
  return (
    <AlertDialogPrimitive.Cancel className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors">
      {children}
    </AlertDialogPrimitive.Cancel>
  )
}

export function AlertDialogAction({ children, className = '', onClick }) {
  return (
    <AlertDialogPrimitive.Action
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${className}`}
    >
      {children}
    </AlertDialogPrimitive.Action>
  )
}
