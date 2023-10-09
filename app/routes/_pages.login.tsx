import { json } from "@remix-run/node"
import { Button } from "~/components/ui/button"

export const loader = async () => {
	return json({ title: "Sign In" })
}

export default function LogIn() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
				<h2 className="mb-2 font-heading text-lg">Sign In with</h2>

				<div className="mb-6 mt-6 flex items-center gap-4">
					<Button variant="outline" asChild>
						<a className="flex-grow" href="/auth/steam">
							<SteamIcon className="color-black dark:invert h-4 w-4 mr-2" />{" "}
							Steam
						</a>
					</Button>

					<Button variant="outline" disabled className="flex-grow">
						Xbox (Coming Soon)
					</Button>
				</div>

				<h2 className="mb-2 font-heading text-lg">Disclaimer</h2>
				<p className="mb-6">
					This website is not affiliated with or endorsed by Fatshark. This
					website uses unofficial access to your account and has full permission
					to it. Use at your own risk. This website has <strong>no</strong>{" "}
					access to your Steam or Xbox account, only your Darktide account.
				</p>
			</div>
			<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
				<h2 className="mb-2 font-heading text-lg">Why?</h2>
				<p className="mb-6">
					Sign in with your account and then authorise using the{" "}
					<a
						className="underline"
						href="https://www.nexusmods.com/warhammer40kdarktide/mods/178"
					>
						DTAuth mod
					</a>{" "}
					to enable managing your account from this website.{" "}
				</p>
				<p className="font-bold">Features:</p>
				<ul className="mb-6 ml-5 list-square">
					<li>Use the weapon shops!</li>
					<li>Track and reroll your contracts!</li>
					<li>View the mission board! Mission ID history</li>
					<li>Manage your inventories, loadouts & builds</li>
					<li>Notifications or auto-purchasing items</li>
				</ul>
			</div>
		</div>
	)
}

function SteamIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 88.5 88.5">
			<g>
				<path d="M44.1,0C20.8,0,1.8,17.9,0,40.7l23.7,9.8c2-1.4,4.4-2.2,7-2.2c0.2,0,0.5,0,0.7,0L42,33.1c0-0.1,0-0.1,0-0.2   c0-9.2,7.5-16.7,16.7-16.7c9.2,0,16.7,7.5,16.7,16.7s-7.5,16.7-16.7,16.7c-0.1,0-0.3,0-0.4,0l-15,10.7c0,0.2,0,0.4,0,0.6   c0,6.9-5.6,12.5-12.5,12.5c-6.1,0-11.1-4.3-12.3-10.1l-17-7c5.2,18.6,22.3,32.2,42.6,32.2c24.4,0,44.2-19.8,44.2-44.2   C88.3,19.8,68.5,0,44.1,0" />
				<path d="M27.7,67.1l-5.4-2.2c1,2,2.6,3.7,4.8,4.6c4.8,2,10.3-0.3,12.3-5.1c1-2.3,1-4.9,0-7.2c-1-2.3-2.8-4.1-5.1-5.1   c-2.3-1-4.8-0.9-6.9-0.1l5.6,2.3c3.5,1.5,5.2,5.5,3.7,9C35.3,66.9,31.2,68.6,27.7,67.1" />
				<path d="M69.8,32.8c0-6.1-5-11.1-11.1-11.1c-6.1,0-11.1,5-11.1,11.1c0,6.1,5,11.1,11.1,11.1   C64.8,43.9,69.8,39,69.8,32.8 M50.3,32.8c0-4.6,3.7-8.3,8.4-8.3s8.4,3.7,8.4,8.3s-3.7,8.3-8.4,8.3S50.3,37.4,50.3,32.8" />
			</g>
		</svg>
	)
}
