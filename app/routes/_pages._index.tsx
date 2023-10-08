import { json } from "@remix-run/node"

export const loader = async () => {
	return json({ title: "Darkti.de - unofficial community tools" })
}

export default function Home() {
	return (
		<div className="px-4 py-6 sm:px-0">
			<div className="h-96 rounded-lg border bg-card text-card-foreground shadow-sm p-4">
				A better homepage coming soon...
			</div>
		</div>
	)
}
