import type { LoaderArgs } from "@remix-run/node"
import { Suspense } from "react"
import { defer } from "@remix-run/node"
import { useLoaderData, Await } from "@remix-run/react"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { BlessingSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountTrait } from "~/services/darktide.server"
import { classnames } from "~/utils/classnames"

export let loader = async ({ request }: LoaderArgs) => {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)
	if (auth) {
		let traits = await getItems(BlessingSchema)
		let traitCategories = traits
			.map((trait) => {
				let match = trait.id.match(/^content\/items\/traits\/([\w_]+)\//)
				if (match) {
					return match[1]
				}
				return undefined
			})
			.filter(Boolean)
			.map((category) =>
				// ! because TypeScript is confused??? we're in an if (auth) check...
				getAccountTrait(auth!, category)
			)
		return defer({ traitCategories: Promise.all(traitCategories) })
	}

	return defer({ traitCategories: new Promise((_, rej) => rej()) })
}

export default function Traits() {
	let data = useLoaderData<typeof loader>()

	return (
		<>
			<h1 className="sr-only">Trait Collection</h1>
			<div className="m-auto w-2/3">
				<Suspense fallback={<p>Loading package location...</p>}>
					<Await
						resolve={data.traitCategories}
						errorElement={<p>Error loading package location!</p>}
					>
						{(traitCategories) => (
							<div className="">
								{traitCategories.map((cat, i) => (
									<div key={i}>
										{cat.map((trait) => (
											<div key={trait.trait}>
												<div>{trait.trait}</div>
												{trait.ranks.map((rank, i) => (
													<div
														key={i}
														className={classnames(
															rank === "invalid" && "hidden"
														)}
													>
														{i + 1}: {rank}
													</div>
												))}
											</div>
										))}
									</div>
								))}
							</div>
						)}
					</Await>
				</Suspense>
			</div>
		</>
	)
}
