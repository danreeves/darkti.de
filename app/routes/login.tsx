import { json } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { AlertTriangle } from "lucide-react"
import { Button } from "~/components/ui/button"
import steamLogo from "~/img/steam_logo.svg"
import xboxLogo from "~/img/xbox_logo.svg"

export const loader = async () => {
	return json({ title: "Sign In" })
}

export default function LogIn() {
	return (
		<>
			<div
				className="flex rounded-lg bg-yellow-100 p-4 text-sm text-yellow-700 mb-4 max-w-3xl mx-auto"
				role="alert"
			>
				<AlertTriangle className="mr-3 inline h-5 w-5" aria-hidden="true" />
				<div>
					<p className="font-medium">No longer accepting sign ups!</p>
					<p>
						FatShark have made changes that prevent the DTAuth mod from working,
						so the site will be disabled until a new authentication method is
						available. The{" "}
						<Link className="underline" to="/extension">
							Armoury Exchange Extension
						</Link>{" "}
						is still working and available.
					</p>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
					<h2 className="mb-2 font-heading text-lg">Sign In with</h2>

					<div className="mb-6 mt-6 flex items-center gap-4">
						<Button variant="outline" disabled className="flex-grow">
							{/* <a className="flex-grow" href="/auth/steam"> */}
							<>
								<img alt="" src={steamLogo} className="h-4 w-4 mr-1" /> Steam
							</>
							{/* </a> */}
						</Button>

						<Button variant="outline" disabled className="flex-grow">
							<img alt="" src={xboxLogo} className="h-4 w-4 mr-1" /> Xbox
						</Button>
					</div>

					<h2 className="mb-2 font-heading text-lg">Disclaimer</h2>
					<p className="mb-6">
						This website is not affiliated with or endorsed by Fatshark. This
						website uses unofficial access to your account and has full
						permission to it. Use at your own risk. This website has{" "}
						<strong>no</strong> access to your Steam or Xbox account, only your
						Darktide account.
					</p>
				</div>
				<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
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
						<li>View the mission board! Mission ID history!</li>
						<li>
							<b>TODO:</b> Manage your inventories, loadouts & builds
						</li>
						<li>
							<b>TODO:</b> Notifications or auto-purchasing items
						</li>
					</ul>
				</div>
			</div>
		</>
	)
}
