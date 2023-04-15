import { json } from "@remix-run/node"

export const loader = async () => {
	return json({ title: "Sign In" })
}

let comingSoon = <span className="text-gray-400">(Coming Soon)</span>

export default function LogIn() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Sign In with</h2>

				<div className="mb-6 mt-6 flex items-center gap-4">
					<a
						className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center"
						href="/auth/steam"
					>
						Steam
					</a>

					<a className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center">
						Xbox {comingSoon}
					</a>
				</div>

				<h2 className="mb-2 font-heading text-lg">Disclaimer</h2>
				<p className="mb-6">
					This website is not affiliated with or endorsed by Fatshark. This
					website uses unofficial access to your account and has full permission
					to it. Use at your own risk. This website has <strong>no</strong>{" "}
					access to your Steam or Xbox account, only your Darktide account.
				</p>
			</div>
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Why?</h2>
				<p className="mb-6">
					Sign in with your account and then authorise using the DTAuth mod to
					enabling managing your account from this website.{" "}
				</p>
				<p>Features:</p>
				<ul className="mb-6 ml-5 list-square">
					<li>Manage your inventories {comingSoon}</li>
					<li>Use the weapon shops {comingSoon}</li>
					<li>Crafting {comingSoon}</li>
					<li>Notifications or auto-purchasing items {comingSoon}</li>
				</ul>
			</div>
		</div>
	)
}
