import { Moon, Sun } from "lucide-react"
import { useTheme } from "~/hooks/themeProvider"

import { Button } from "~/components/ui/button"
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components"

export function ThemeToggle() {
	const { setTheme } = useTheme()

	return (
		<MenuTrigger>
			<Button variant="outline">
				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Toggle theme</span>
			</Button>
			<Popover>
				<Menu
					className={
						"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
					}
				>
					<MenuItem
						className={
							"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
						}
						onAction={() => setTheme("light")}
					>
						Light
					</MenuItem>
					<MenuItem
						className={
							"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
						}
						onAction={() => setTheme("dark")}
					>
						Dark
					</MenuItem>
					<MenuItem
						className={
							"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
						}
						onAction={() => setTheme("system")}
					>
						System
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	)
}
