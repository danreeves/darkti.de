import { json } from "@remix-run/node"
import exampleImage from "~/img/extension-screenshot.png"

export const loader = async () => {
	return json({ title: "Armoury Exchange Extension" })
}

export default function Extension() {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<div className="rounded bg-white p-6 shadow">
				<p className="mb-6">
					The Armoury Exchange browser extension is a community made tool for
					accessing both the Armoury Exchange and Melk's Emporium outside of the
					game for all your characters.
				</p>
				<h2 className="mb-2 font-heading text-xl">Features</h2>
				<ul className="mb-6 ml-5 list-square">
					<li>View the in game stores without starting the game</li>
					<li>Rule based item filtering</li>
					<li>Privacy & safety focussed</li>
				</ul>
				<h2 className="mb-2 font-heading text-xl">Installation</h2>
				<p className="mb-6">
					The extension is available for all Chromium (Chrome, Opera, Brave,
					Edge) based browsers and Firefox!
				</p>
				<div className="mb-6 flex items-center gap-4">
					<a
						className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center"
						href="https://chrome.google.com/webstore/detail/armoury-exchange/hcjihmkcnjkfkaeebhnpjcnnibpoolgc"
					>
						Chrome Web Store
					</a>

					<a
						className="flex-grow rounded border border-gray-200 bg-neutral-100 p-4 text-center"
						href="https://addons.mozilla.org/en-GB/firefox/addon/armoury-exchange/"
					>
						Firefox Addons Store
					</a>
				</div>

				<h2 className="mb-2 font-heading text-xl">Contributing</h2>
				<p>
					The extension is open source and accepting contributions! Check the
					code out on{" "}
					<a
						className="underline"
						href="https://github.com/danreeves/dt-exchange"
					>
						GitHub
					</a>
					. You can also report issues on the{" "}
					<a
						className="underline"
						href="https://github.com/danreeves/dt-exchange/issues"
					>
						Issue Tracker
					</a>
					.
				</p>
			</div>
			<img
				className="w-full overflow-hidden rounded bg-white shadow"
				src={exampleImage}
				alt="Screenshot of the Armoury Exchange extension in use"
			/>
		</div>
	)
}
