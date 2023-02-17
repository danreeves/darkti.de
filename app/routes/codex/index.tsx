import { Link } from "@remix-run/react";
import { json } from "@remix-run/node";

export const loader = async () => {
	return json({ title: "Codex" });
};

export default function Codex() {
	return (
		<div className="px-4 py-6 sm:px-0">
			<div className="h-96 rounded-lg border-4 border-dashed border-gray-200">
				<Link to="weapons">Weapons</Link>
				<Link to="curios">Curios</Link>
			</div>
		</div>
	);
}
