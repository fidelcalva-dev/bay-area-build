import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tap-highlight",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-border bg-background hover:bg-muted hover:border-muted-foreground/20 text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Apple-style CTA - vibrant with glow
        cta: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-cta hover:shadow-lg active:scale-[0.98] font-bold",
        ctaOutline: "border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold",
        // Hero variants - larger, more prominent
        hero: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-cta hover:shadow-lg active:scale-[0.98] font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl",
        heroOutline: "border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm font-semibold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl",
        heroSecondary: "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm font-semibold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl",
        // Mobile bar variants
        mobileBar: "flex-1 flex-col gap-0.5 py-2 px-2 text-xs font-medium bg-transparent hover:bg-accent/10 rounded-none",
        mobileBarCta: "flex-1 flex-col gap-0.5 py-2 px-2 text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-none",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-xl",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-6 text-base",
        xl: "h-14 rounded-2xl px-8 text-lg",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
