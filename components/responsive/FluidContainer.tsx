import React from "react";
import { cn } from "@/lib/utils"; // Assumindo utils do shadcn

interface FluidContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  containerName?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  noPadding?: boolean;
}

export const FluidContainer = React.forwardRef<HTMLDivElement, FluidContainerProps>(
  (
    { 
      as: Component = "div", 
      className, 
      children, 
      containerName, 
      maxWidth = "2xl", 
      noPadding = false,
      ...props 
    }, 
    ref
  ) => {
    // Definimos max-width baseado no breakpoint prop
    const maxWidthClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    };

    return (
      <Component
        ref={ref}
        style={containerName ? { containerName, containerType: "inline-size" } : { 
          containerType: "inline-size" 
        }}
        className={cn(
          // Responsividade base: centralizado, largura total e limites definidos
          "w-full mx-auto",
          maxWidthClasses[maxWidth],
          // Padding lateral fluido (se não estiver desabilitado)
          !noPadding && "px-fluid-4 sm:px-fluid-6 lg:px-fluid-8",
          // Define a região como um container para Container Queries (@tailwindcss/container-queries)
          "@container",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

FluidContainer.displayName = "FluidContainer";
