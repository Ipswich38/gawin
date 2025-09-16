import * as React from "react";
import { cn } from "./utils";

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>({});

const Select = React.forwardRef<
  HTMLDivElement,
  {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
  }
>(({ value, onValueChange, children }, ref) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange: setOpen }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, children, ...props }, ref) => {
  const { value, open, onOpenChange } = React.useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpenChange?.(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-orange-200 bg-white/95 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <span className="ml-2">▼</span>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span"> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span ref={ref} className={cn("block truncate", className)} {...props}>
      {value || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full z-50 mt-1 w-full rounded-md border border-orange-200 bg-white shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { onValueChange, onOpenChange } = React.useContext(SelectContext);
  
  return (
    <div
      ref={ref}
      onClick={() => {
        onValueChange?.(value);
        onOpenChange?.(false);
      }}
      className={cn(
        "cursor-pointer px-3 py-2 text-sm hover:bg-orange-50 focus:bg-orange-50 focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };