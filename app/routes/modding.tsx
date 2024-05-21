import { json } from "@remix-run/cloudflare"
import { Button } from "~/components/ui/button"

export const loader = async () => {
	return json({ title: "Modding" })
}

export default function Modding() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
				<h2 className="mb-2 font-heading text-lg">Using mods</h2>

				<p className="mb-4">
					Check out the{" "}
					<a
						className="underline"
						href="https://dmf-docs.darkti.de/#/installing-mods"
					>
						installation guide!
					</a>{" "}
					Mods can be found on{" "}
					<a
						href="https://www.nexusmods.com/warhammer40kdarktide"
						className="underline"
					>
						Nexus Mods
					</a>
					.
				</p>

				<p className="mb-4">
					If you want a more graphical interface, try the{" "}
					<a
						href="https://github.com/danreeves/vortex-extension-darktide"
						className="underline"
					>
						Vortex Mod Loader Extension
					</a>
					.
				</p>

				<p className="mb-4">
					Need more help?{" "}
					<Button variant="outline">
						<a href="https://discord.gg/GFyCGNpJb8">
							Join the Darktide Modders Discord!
						</a>
					</Button>
				</p>
			</div>
			<div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
				<h2 className="mb-2 font-heading text-lg">Making mods</h2>
				<p className="mb-6">
					There's a growing community to mod developers, come join us!
				</p>

				<div className="flex flex-col gap-4">
					<Button variant="outline">
						<a
							href="https://dmf-docs.darkti.de/#/creating-mods"
							className="flex-grow p-4 text-center"
						>
							Check out the Darktide Mod Framework docs!
						</a>
					</Button>

					<Button variant="outline" asChild>
						<a
							href="https://discord.gg/GFyCGNpJb8"
							className="flex-grow p-4 text-center"
						>
							Join the Darktide Modders Discord!
						</a>
					</Button>
				</div>
			</div>
		</div>
	)
}
