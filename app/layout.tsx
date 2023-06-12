import { Fragment } from "react"
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { Link, NavLink, Outlet } from "@remix-run/react"
import type { User } from "./services/auth.server"
import { classnames } from "./utils/classnames"

const navigation = [
	{ name: "Armoury", href: "/armoury" },
	{ name: "Mission Board", href: "/mission-board" },
	{ name: "Codex", href: "/codex" },
	{ name: "Extension", href: "/extension" },
	{ name: "Modding", href: "/modding" },
]
const userNavigation = [
	{ name: "Settings", href: "/settings" },
	{ name: "Sign out", href: "/logout" },
]

export default function Layout({ user }: { user: User | null }) {
	return (
		<>
			<div className="flex h-screen flex-col overflow-hidden">
				<Disclosure as="nav" className="bg-neutral-800">
					{({ open }) => (
						<>
							<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
								<div className="flex h-12 items-center justify-between">
									<div className="flex items-center">
										<Link to="/" className="flex items-center">
											<div className="flex-shrink-0">
												<img
													className="h-8 w-8 invert"
													src="/favicon-32x32.png"
													alt=""
												/>
											</div>
											<span className="mx-2 font-heading uppercase text-white">
												Darkti.de
											</span>
										</Link>
										<div className="hidden md:block">
											<div className="ml-10 flex items-baseline space-x-4">
												{navigation.map((item) => (
													<NavLink
														key={item.name}
														to={item.href}
														className={({ isActive }) =>
															classnames(
																isActive
																	? "bg-neutral-900 text-white"
																	: "text-neutral-300 hover:bg-neutral-700 hover:text-white",
																"rounded-md px-3 py-2 text-sm font-medium"
															)
														}
													>
														{item.name}
													</NavLink>
												))}
											</div>
										</div>
									</div>
									{user ? (
										<div className="hidden md:block">
											<div className="ml-4 flex items-center md:ml-6">
												{/* Profile dropdown */}
												<Menu as="div" className="relative ml-3">
													<div>
														<Menu.Button className="flex max-w-xs items-center rounded-full bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800">
															<span className="sr-only">Open user menu</span>
															<img
																className="h-8 w-8 rounded-full"
																src={user?.avatar}
																alt=""
															/>
														</Menu.Button>
													</div>
													<Transition
														as={Fragment}
														enter="transition ease-out duration-100"
														enterFrom="transform opacity-0 scale-95"
														enterTo="transform opacity-100 scale-100"
														leave="transition ease-in duration-75"
														leaveFrom="transform opacity-100 scale-100"
														leaveTo="transform opacity-0 scale-95"
													>
														<Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
															{userNavigation.map((item) => (
																<Menu.Item key={item.name}>
																	{({ active }) => (
																		<NavLink
																			to={item.href}
																			className={classnames(
																				active ? "bg-neutral-100" : "",
																				"block px-4 py-2 text-sm text-neutral-700"
																			)}
																		>
																			{item.name}
																		</NavLink>
																	)}
																</Menu.Item>
															))}
														</Menu.Items>
													</Transition>
												</Menu>
											</div>
										</div>
									) : (
										<NavLink
											to="/login"
											className="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white"
										>
											Sign In
										</NavLink>
									)}
									<div className="-mr-2 flex md:hidden">
										{/* Mobile menu button */}
										<Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-neutral-800 p-2 text-neutral-400 hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800">
											<span className="sr-only">Open main menu</span>
											{open ? (
												<XMarkIcon
													className="block h-6 w-6"
													aria-hidden="true"
												/>
											) : (
												<Bars3Icon
													className="block h-6 w-6"
													aria-hidden="true"
												/>
											)}
										</Disclosure.Button>
									</div>
								</div>
							</div>

							<Disclosure.Panel className="md:hidden">
								<div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
									{navigation.map((item) => (
										<NavLink
											key={item.name}
											to={item.href}
											className={({ isActive }) =>
												classnames(
													isActive
														? "bg-neutral-900 text-white"
														: "text-neutral-300 hover:bg-neutral-700 hover:text-white",
													"block rounded-md px-3 py-2 text-base font-medium"
												)
											}
										>
											{item.name}
										</NavLink>
									))}
								</div>
								{/* <div className="border-t border-neutral-700 pt-4 pb-3"> */}
								{/* 	<div className="flex items-center px-5"> */}
								{/* <div className="flex-shrink-0"> */}
								{/* 	<img */}
								{/* 		className="h-10 w-10 rounded-full" */}
								{/* 		src={user.imageUrl} */}
								{/* 		alt="" */}
								{/* 	/> */}
								{/* </div> */}
								{/* <div className="ml-3"> */}
								{/* 	<div className="text-base font-medium leading-none text-white"> */}
								{/* 		{user.name} */}
								{/* 	</div> */}
								{/* 	<div className="text-sm font-medium leading-none text-neutral-400"> */}
								{/* 		{user.email} */}
								{/* 	</div> */}
								{/* </div> */}
								{/* 	<button */}
								{/* 		type="button" */}
								{/* 		className="ml-auto flex-shrink-0 rounded-full bg-neutral-800 p-1 text-neutral-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800" */}
								{/* 	> */}
								{/* 		<span className="sr-only">View notifications</span> */}
								{/* 		<BellIcon className="h-6 w-6" aria-hidden="true" /> */}
								{/* 	</button> */}
								{/* </div> */}
								{/* <div className="mt-3 space-y-1 px-2"> */}
								{/* 	{userNavigation.map((item) => ( */}
								{/* 		<NavLink */}
								{/* 			key={item.name} */}
								{/* 			to={item.href} */}
								{/* 			className={({ isActive }) => */}
								{/* 				classnames( */}
								{/* 					isActive */}
								{/* 						? "bg-neutral-900 text-white" */}
								{/* 						: "text-neutral-300 hover:bg-neutral-700 hover:text-white", */}
								{/* 					"block rounded-md px-3 py-2 text-base font-medium" */}
								{/* 				) */}
								{/* 			} */}
								{/* 		> */}
								{/* 			{item.name} */}
								{/* 		</NavLink> */}
								{/* 	))} */}
								{/* </div> */}
								{/* </div> */}
							</Disclosure.Panel>
						</>
					)}
				</Disclosure>

				<Outlet />
			</div>
		</>
	)
}
