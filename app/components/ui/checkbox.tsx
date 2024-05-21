import * as React from "react"
import { Checkbox as RACCheckbox } from "react-aria-components"
import { Check } from "lucide-react"

import { cn } from "~/utils/cn"

const Checkbox = React.forwardRef<
	React.ElementRef<typeof RACCheckbox>,
	React.ComponentPropsWithoutRef<typeof RACCheckbox>
>(({ className, ...props }, ref) => (
	<RACCheckbox
		ref={ref}
		className={cn(
			"peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
			className,
		)}
		{...props}
	>
		<Check className="h-4 w-4" />
	</RACCheckbox>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
