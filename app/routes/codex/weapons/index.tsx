import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
	Form,
	Link,
	useLoaderData,
	useSearchParams,
	useSubmit,
} from "@remix-run/react"
import type { ReactNode } from "react"
import { useRef } from "react"
import { getItems } from "~/data/items.server"

function getAllOr<T>(
	searchParams: URLSearchParams,
	key: string,
	fallback: T
): string[] | T {
	return searchParams.has(key) ? searchParams.getAll(key) : fallback
}

export const loader = async ({ request }: LoaderArgs) => {
	const url = new URL(request.url)
	const item_type = getAllOr(url.searchParams, "type", ["melee", "ranged"])
	const archetypes = getAllOr(url.searchParams, "archetype", undefined)
	const name = url.searchParams.get("name") ?? undefined
	const weapons = await getItems({ item_type, archetypes, name })
	return json({ title: "Weapons", weapons })
}

type CheckboxProps = {
	value: string
	name: string
	label: string
}
function Checkbox({ value, name, label }: CheckboxProps) {
	const [searchParams] = useSearchParams()
	const param = searchParams.getAll(name)

	return (
		<label htmlFor={value} className="m-2 inline-flex items-center">
			<input
				type="checkbox"
				id={value}
				name={name}
				value={value}
				defaultChecked={param.includes(value)}
				className="mr-2
                          rounded
                          border-transparent
                          bg-gray-200 text-gray-700
                          focus:border-transparent
                          focus:bg-gray-200 focus:ring-1 focus:ring-gray-500
						  focus:ring-offset-2
                        "
			/>
			{label}
		</label>
	)
}

function TextInput({
	label,
	name,
	className,
}: {
	label: string
	name: string
	className?: string
}) {
	const [searchParams] = useSearchParams()
	const value = searchParams.get(name) ?? ""

	return (
		<label htmlFor={name} className={`flex flex-col ${className}`}>
			<span className="font-heading text-xs font-black uppercase">{label}</span>
			<input
				type="text"
				name={name}
				id={name}
				defaultValue={value}
				className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border-gray-300
					border-transparent
                    bg-white
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  "
			/>
		</label>
	)
}

function FormGroup({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) {
	return (
		<div className="flex flex-col ">
			<div className="mx-2 font-heading text-xs font-bold uppercase">
				{label}
			</div>
			<div>{children}</div>
		</div>
	)
}

export default function Weapons() {
	const { weapons } = useLoaderData<typeof loader>()
	const submit = useSubmit()

	const formRef = useRef<HTMLFormElement>(null)

	return (
		<>
			<Form
				ref={formRef}
				method="get"
				onChange={(e) => submit(e.currentTarget)}
				className="mb-2 flex flex-row items-center gap-4"
			>
				<FormGroup label="Item type">
					<Checkbox name="type" value="melee" label="Melee" />
					<Checkbox name="type" value="ranged" label="Ranged" />
				</FormGroup>

				<FormGroup label="Class">
					<Checkbox name="archetype" value="veteran" label="Veteran" />
					<Checkbox name="archetype" value="zealot" label="Zealot" />
					<Checkbox name="archetype" value="psyker" label="Psyker" />
					<Checkbox name="archetype" value="ogryn" label="Ogryn" />
				</FormGroup>

				<TextInput label="Search" name="name" className="ml-auto items-end" />
			</Form>
			<ul className="grid grid-cols-1 md:grid-cols-2">
				{weapons.map((weapon) => {
					return (
						<li
							className=" group relative m-2 overflow-hidden rounded bg-white shadow hover:shadow-lg"
							key={weapon.id}
						>
							<div className="pointer-events-none absolute top-0 right-0 z-0 aspect-video h-full overflow-hidden ">
								<img
									alt=""
									src={`https://img.darkti.de/pngs/${weapon.preview_image}.png`}
									className="h-full transition duration-75 group-hover:scale-105"
								/>
							</div>
							<Link
								to={weapon.slug}
								className="isolate z-10 block h-full w-full p-4"
							>
								<div className="mb-2 text-lg font-bold">
									{weapon.display_name}
								</div>
								<TagList tags={weapon.tags} />
								<TagList tags={weapon.archetypes} />
							</Link>
						</li>
					)
				})}
			</ul>
			{weapons.length < 1 ? (
				<div className="px-4 py-6 sm:px-0">
					<div className="grid h-96 place-content-center rounded-lg border-4 border-dashed border-gray-200">
						<span className="font-heading text-lg font-black text-neutral-400">
							No results
						</span>
					</div>
				</div>
			) : null}
		</>
	)
}

function TagList({ tags }: { tags: string[] }) {
	return (
		<div className="center-items flex gap-2 py-1">
			{tags.map((tag) => (
				<div
					key={tag}
					className="small-caps inline-block rounded bg-neutral-200 p-1.5 text-xs font-bold uppercase text-neutral-500"
				>
					{tag}
				</div>
			))}
		</div>
	)
}
