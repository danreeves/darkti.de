import { Disclosure } from "@headlessui/react"
import { Link, NavLink, Outlet } from "@remix-run/react"
import type { User } from "./services/auth.server"
import { ThemeToggle } from "~/components/ThemeToggle"
import { Button, buttonVariants } from "~/components/ui/button"
import { cn } from "~/utils/cn"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "~/components/ui/dropdown-menu"
import { X, Menu } from "lucide-react"

const navigation = [
	{ name: "Armoury", href: "/armoury" },
	{ name: "Mission Board", href: "/mission-board" },
	{ name: "Codex", href: "/codex" },
	{ name: "Extension", href: "/extension" },
	{ name: "Modding", href: "/modding" },
] as const
const userNavigation = [
	{ name: "Settings", href: "/settings" },
	{ name: "Sign out", href: "/logout" },
] as const

export default function Layout({ user }: { user: User | null }) {
	return (
		<>
			<div className="flex h-screen flex-col bg-background">
				<Disclosure
					as="nav"
					className="border-b sticky top-0 z-50 bg-background"
				>
					{({ open }) => (
						<>
							<div className="mx-auto max-w-7xl px-4 xl:p-0">
								<div className="flex h-12 items-center justify-between">
									<div className="flex items-center">
										<Link to="/" className="flex items-center mr-4">
											<div className="flex-shrink-0">
												<img
													className="h-8 w-8 dark:invert"
													src="/favicon-32x32.png"
													alt=""
												/>
											</div>
											<span className="mx-2 font-heading uppercase text-foreground font-black text-lg">
												Darkti.de
											</span>
										</Link>
										<div className="hidden md:block">
											<div className="flex items-baseline gap-4">
												{navigation.map((item) => (
													<NavLink
														key={item.name}
														to={item.href}
														className="aria-[current=page]:text-foreground aria-[current=page]:font-bold text-foreground/60 block text-base"
													>
														{item.name}
													</NavLink>
												))}
											</div>
										</div>
									</div>
									<div className="flex gap-1">
										{user ? (
											<div className="hidden md:block">
												<div className="ml-4 flex items-center md:ml-6">
													{/* Profile dropdown */}
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="outline" size="icon">
																<span className="sr-only">Open user menu</span>
																<img
																	className="rounded-md"
																	src={user?.avatar}
																	alt=""
																/>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															{userNavigation.map((item) => (
																<DropdownMenuItem asChild key={item.href}>
																	<NavLink
																		to={item.href}
																		className="aria-[current=page]:text-foreground text-foreground/60 w-full h-full flex px-4 py-2 text-sm"
																	>
																		{item.name}
																	</NavLink>
																</DropdownMenuItem>
															))}
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										) : (
											<NavLink
												to="/login"
												className="aria-[current=page]:text-foreground text-foreground/60 block rounded-md px-3 py-2 text-base font-medium"
											>
												Sign In
											</NavLink>
										)}
										<ThemeToggle />
										<div className="-mr-2 flex md:hidden">
											{/* Mobile menu button */}
											<Disclosure.Button
												className={cn(
													buttonVariants({ variant: "outline", size: "icon" }),
												)}
											>
												<span className="sr-only">Open main menu</span>
												{open ? (
													<X className="block h-6 w-6" aria-hidden="true" />
												) : (
													<Menu className="block h-6 w-6" aria-hidden="true" />
												)}
											</Disclosure.Button>
										</div>
									</div>
								</div>
							</div>

							{/* The small screen menu */}
							<Disclosure.Panel className="md:hidden">
								<div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
									{navigation.map((item) => (
										<NavLink
											key={item.name}
											to={item.href}
											className="aria-[current=page]:text-foreground text-foreground/60 block rounded-md px-3 py-2 text-base font-medium"
										>
											{item.name}
										</NavLink>
									))}
									{user ? (
										<div className="md:hidden">
											{userNavigation.map((item) => (
												<NavLink
													key={item.href}
													to={item.href}
													className="aria-[current=page]:text-foreground text-foreground/60 block rounded-md px-3 py-2 text-base font-medium"
												>
													{item.name}
												</NavLink>
											))}
										</div>
									) : null}
								</div>
							</Disclosure.Panel>
						</>
					)}
				</Disclosure>

				<Outlet />
			</div>
		</>
	)
}
