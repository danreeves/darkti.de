import { json } from "@remix-run/cloudflare"
import { Button } from "~/components/ui/button"
import exampleImage from "~/img/extension-screenshot.png"

export const loader = async () => {
	return json({ title: "Armoury Exchange Extension" })
}

export default function Extension() {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
				<p className="mb-6">
					The Armoury Exchange browser extension is a community made tool for
					accessing both the Armoury Exchange and Melk's Emporium outside of the
					game for all your characters.
				</p>
				<h2 className="mb-2 font-heading text-xl">Features</h2>
				<ul className="mb-6 list-inside list-square">
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
					<Button variant="outline" asChild>
						<a
							className="flex-grow p-4 text-center"
							href="https://chrome.google.com/webstore/detail/armoury-exchange/hcjihmkcnjkfkaeebhnpjcnnibpoolgc"
						>
							Chrome Web Store
						</a>
					</Button>

					<Button variant="outline" asChild>
						<a
							className="flex-grow p-4 text-center"
							href="https://addons.mozilla.org/en-GB/firefox/addon/armoury-exchange/"
						>
							Firefox Addons Store
						</a>
					</Button>
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
