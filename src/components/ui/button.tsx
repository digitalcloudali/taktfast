import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Taktfast-knapper: rektangulære med 5px radius, 40–44px høye.
// Primær: marineblå med hvit tekst, hover inverterer til hvit bg + marineblå tekst + 2px marineblå kant.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] border-2 border-transparent text-[16px] font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:border-transparent disabled:bg-[#DFDFDF] disabled:text-[#9F9F9F] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#216BA5]",
  {
    variants: {
      variant: {
        default:
          "bg-[#00205B] text-white border-[#00205B] hover:bg-white hover:text-[#00205B]",
        destructive:
          "bg-[#D6001C] text-white border-[#D6001C] hover:bg-[#B80040] hover:border-[#B80040]",
        outline:
          "bg-white text-[#00205B] border-[#CCD2DE] hover:border-[#00205B]",
        outlineNavy:
          "bg-transparent text-white border-white/70 hover:bg-white hover:text-[#00205B]",
        secondary:
          "bg-[#EEF5FC] text-[#00205B] border-transparent hover:bg-[#00205B] hover:text-white",
        ghost:
          "bg-transparent text-[#00205B] border-transparent hover:bg-[#EEF5FC]",
        white:
          "bg-white text-[#00205B] border-white hover:bg-[#00205B] hover:text-white",
        link: "border-transparent bg-transparent text-[#00205B] font-semibold hover:underline",
      },
      size: {
        default: "h-10 px-4",
        lg: "h-11 px-6",
        xl: "h-12 px-7 text-[17px]",
        sm: "h-8 rounded-[5px] px-3 text-sm",
        icon: "h-[43px] w-[43px] rounded-full border-transparent p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
