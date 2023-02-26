import { json } from "@remix-run/node"

export const loader = async () => {
	return json({ title: "Modding" })
}

export default function Modding() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Using mods</h2>
				<p>
					<a href="https://discord.gg/GFyCGNpJb8">Modders discord</a>
				</p>
				<p>
					<a href="https://www.nexusmods.com/warhammer40kdarktide">Nexus Mods</a>
				</p>
				<p>
					<a href="https://github.com/danreeves/vortex-extension-darktide">Vortex Mod Loader Extension</a>
				</p>
			</div>
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Making mods</h2>
				<p className="italic text-gray-400">Coming soon...</p>
			</div>
		</div>
	)
}
