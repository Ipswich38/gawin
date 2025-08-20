import * as React from "react";
import { cn } from "./utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "bg-white/95 backdrop-blur-sm text-gray-900 flex flex-col gap-6 rounded-xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300",
        className,
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 107, 53, 0.2)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        ...props.style
      }}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6",
        "has-[data-slot=card-action]:grid-cols-[1fr_auto]",
        "[&:has(+[data-slot=card-content])]:pb-0",
        "[&:not(:has(+[data-slot=card-content]))]:pb-6",
        className,
      )}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"h4">
>(({ className, ...props }, ref) => {
  return (
    <h4
      ref={ref}
      data-slot="card-title"
      className={cn(
        "text-xl font-semibold leading-tight text-gray-900",
        className
      )}
      style={{
        color: '#1F2937',
        fontWeight: '600',
        ...props.style
      }}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn(
        "text-sm text-gray-600 leading-relaxed",
        className
      )}
      style={{
        color: '#6B7280',
        lineHeight: '1.6',
        ...props.style
      }}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
});
CardAction.displayName = "CardAction";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn(
        "px-6 text-gray-700",
        "[&:last-child]:pb-6",
        className
      )}
      style={{
        color: '#374151',
        ...props.style
      }}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 px-6 pb-6",
        "[&:not(:first-child)]:pt-6 [&:not(:first-child)]:border-t border-orange-100",
        className
      )}
      style={{
        borderTopColor: 'rgba(255, 107, 53, 0.1)',
        ...props.style
      }}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};