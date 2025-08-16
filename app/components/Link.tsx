import type { ComponentProps } from "react"
import { Link as RouterLink } from "react-router"

const className =
	"border border-green-500 px-4 py-2 text-green-500 hover:bg-green-600 hover:text-black inline-block"

export function Link(props: ComponentProps<typeof RouterLink>) {
	return <RouterLink {...props} className={className} />
}

export function VisualLink(props: ComponentProps<"span">) {
	return <span {...props} className={className} />
}
