import { json } from "@remix-run/node"

export const loader = async () => {
	return json({ title: "Sign In" })
}

export default function LogIn() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Sign In with</h2>

				<div className="mt-6 mb-6 flex items-center gap-4">
					<a
						className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center"
						href="/auth/steam"
					>
						Steam
					</a>

					<a className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center">
						Xbox <span className="text-gray-400">(Coming Soon)</span>{" "}
					</a>
				</div>
			</div>
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Why?</h2>
			</div>
		</div>
	)
}
