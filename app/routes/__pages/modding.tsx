import { json } from "@remix-run/node"

export const loader = async () => {
	return json({ title: "Modding" })
}

export default function Modding() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Using mods</h2>

				<p className="mb-4">Check out the <a href="https://dmf-docs.darkti.de/#/installing-mods" className="underline">installation guide!</a> Mods can be found on <a href="https://www.nexusmods.com/warhammer40kdarktide" className="underline">Nexus Mods</a>.
				</p>

				<p className="mb-4">
					If you want a more graphical interface, try the <a href="https://github.com/danreeves/vortex-extension-darktide" className="underline">Vortex Mod Loader Extension</a>.
				</p>

				<p className="mb-4">Need more help?</p>

				<div className="flex items-center gap-4">
					<a
						className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center"
						href="https://discord.gg/GFyCGNpJb8"
					>
						Join the Darktide Modders Discord!
					</a>
				</div>

			</div>
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Making mods</h2>
				<p className="mb-6">There's a growing community to mod developers, come join us!</p>
				<div className="mb-6 mt-2 flex items-center gap-4">
					<a
						className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center"
						href="https://dmf-docs.darkti.de/#/creating-mods"
					>
						Check out the Darktide Mod Framework docs!
					</a>
				</div>
				<div className=" mt-2 flex items-center gap-4">
					<a
						className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center"
						href="https://discord.gg/GFyCGNpJb8"
					>
						Join the Darktide Modders Discord!
					</a>
				</div>
			</div>
		</div >
	)
}
