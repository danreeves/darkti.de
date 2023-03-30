import { json } from "@remix-run/node";

export const loader = async () => {
	return json({ title: "Darkti.de - A community resource site" });
};

export default function Home() {
	return (
		<div className="px-4 py-6 sm:px-0">
			<div className="h-96 rounded-lg border-4 border-dashed border-gray-200">
				Home
			</div>
		</div>
	);
}
