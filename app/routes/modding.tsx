import { json } from "@remix-run/node"

export const loader = async () => {
	return json({ title: "Modding" })
}

export default function Modding() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Using mods</h2>
				<p className="italic text-gray-400">Coming soon...</p>
			</div>
			<div className="rounded bg-white p-4 shadow">
				<h2 className="mb-2 font-heading text-lg">Making mods</h2>
				<p className="italic text-gray-400">Coming soon...</p>
			</div>
		</div>
	)
}
