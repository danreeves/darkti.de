import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	Outlet,
	redirect,
} from "react-router"
import { Form, useActionData, useLoaderData } from "react-router"
import { Book } from "~/components/Book"

export const meta: MetaFunction = () => {
	return [
		{ title: "Command Terminal - darkti.de" },
		{
			name: "description",
			content: "Imperial command terminal access",
		},
	]
}

type LoaderData = {
	isAuthenticated: boolean
}

type ActionData = {
	error?: string
}

export async function loader({
	request,
	context,
}: LoaderFunctionArgs): Promise<LoaderData> {
	const url = new URL(request.url)
	const sessionCookie = getCookie(request, "admin-session")

	// Check if user is already authenticated
	if (sessionCookie === "authenticated") {
		return { isAuthenticated: true }
	}

	return { isAuthenticated: false }
}

export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData()
	const password = formData.get("password") as string
	const action = formData.get("_action") as string

	if (action === "logout") {
		// Clear the session cookie
		return redirect("/admin", {
			headers: {
				"Set-Cookie":
					"admin-session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/",
			},
		})
	}

	if (action === "login") {
		const adminPassword = context.cloudflare.env.ADMIN_PASSWORD

		if (!password) {
			return { error: "Authentication code is required" }
		}

		if (password !== adminPassword) {
			return { error: "Invalid authentication code" }
		}

		// Set session cookie for 24 hours
		return redirect("/admin/import", {
			headers: {
				"Set-Cookie":
					"admin-session=authenticated; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/",
			},
		})
	}

	return { error: "Invalid action" }
}

function getCookie(request: Request, name: string): string | undefined {
	const cookieHeader = request.headers.get("Cookie")
	if (!cookieHeader) return undefined

	const cookies = cookieHeader.split(";").map((cookie) => cookie.trim())
	const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`))

	return targetCookie ? targetCookie.split("=")[1] : undefined
}

function LoginForm({ actionData }: { actionData?: ActionData }) {
	return (
		<div className="font-warhammer flex min-h-screen items-center justify-center bg-black px-4">
			<div className="w-full max-w-md space-y-8">
				<div className="mb-8 flex flex-row items-center border-b border-green-500 pb-4">
					<Book className="" />
					<h2 className="font-machine flex-1 text-center text-3xl font-extrabold tracking-widest text-green-500">
						+ COMMAND TERMINAL +
					</h2>
				</div>

				<Form method="post" className="mt-8 space-y-6">
					<input type="hidden" name="_action" value="login" />

					<div>
						<label htmlFor="password" className="sr-only">
							Authentication Code
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							className="relative block w-full border border-green-500 bg-black px-3 py-2 text-green-500 placeholder-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
							placeholder="Enter authentication code"
						/>
					</div>

					{actionData?.error && (
						<div className="border border-red-500 bg-red-900/50 p-3">
							<p className="text-sm text-red-200">
								{actionData.error}
							</p>
						</div>
					)}

					<button
						type="submit"
						className="group relative flex w-full justify-center border border-green-500 bg-black px-4 py-2 text-sm font-medium text-green-500 hover:bg-green-600 hover:text-black focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						Authenticate
					</button>
				</Form>
			</div>
		</div>
	)
}

function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="font-warhammer container mx-auto min-h-screen bg-black text-green-500">
			<div className="mb-8 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ COMMAND TERMINAL +++
				</h1>
				<div className="flex items-center">
					<Form method="post" className="inline">
						<input type="hidden" name="_action" value="logout" />
						<button
							type="submit"
							className="border border-green-500 px-4 py-2 text-green-500 hover:bg-green-600 hover:text-black"
						>
							Disconnect
						</button>
					</Form>
				</div>
			</div>
			<main className="p-6">{children}</main>
			<footer className="mt-12 text-center text-sm text-green-600 uppercase">
				<p>++++ For the Emperor ++++</p>
			</footer>
		</div>
	)
}

export default function Admin() {
	const { isAuthenticated } = useLoaderData<LoaderData>()
	const actionData = useActionData<ActionData>()

	if (!isAuthenticated) {
		return <LoginForm actionData={actionData} />
	}

	return (
		<AdminLayout>
			<Outlet />
		</AdminLayout>
	)
}
