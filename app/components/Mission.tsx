import { twMerge } from "tailwind-merge"
import { Img, imgUrl } from "./Img"
import { MissionTimer } from "./MissionTimer"

export function sideObjectiveToType(sideObjectiveName: string) {
	if (sideObjectiveName === "side_mission_grimoire") {
		return "grimoire"
	}

	if (sideObjectiveName === "side_mission_tome") {
		return "scripture"
		// return "tome"
	}

	if (sideObjectiveName === "side_mission_consumable") {
		return "relic"
	}

	return "unknown"
}

type Props = {
	id: string
	texture: string
	type: string
	challenge: number
	name: string
	zone: string
	description: string
	circumstance: { name: string; icon: string } | null
	credits: number
	xp: number
	start: number
	end: number
	extraRewards: {
		circumstance?:
			| {
					credits: number
					xp: number
			  }
			| undefined
		sideMission?:
			| {
					credits: number
					xp: number
			  }
			| undefined
	}
	sideMission: string | null
	missionTypeIcon: string | null
	category: string | null
}
export function Mission({
	id,
	texture,
	type,
	challenge,
	name,
	zone,
	description,
	circumstance,
	credits,
	xp,
	start,
	end,
	extraRewards,
	sideMission,
	missionTypeIcon,
	category,
}: Props) {
	return (
		<div
			key={id}
			data-id={id}
			className={twMerge(
				"relative h-56 w-96 m-3 rounded font-montserrat text-green-100 drop-shadow-lg border",
				category === "auric" && " text-amber-100",
			)}
		>
			<Img
				width={512}
				src={texture}
				className="absolute left-0 top-0 h-full w-full rounded object-cover"
			/>

			<div className="h-full transition-opacity">
				<div
					className="relative h-full w-full pb-2 pl-9"
					style={{
						background: `linear-gradient(180deg,
											hsl(0 0% 0% / 1) 0%,
											hsl(0 0% 0% / 0.35) 80%,
											hsl(0 0% 0% / 0) 100%)`,
					}}
				>
					<div className="flex h-8 flex-row items-center justify-between text-sm">
						<div className="uppercase">{type}</div>

						<div className="mr-2 mt-2 flex h-6 w-full justify-end gap-[2px]">
							{Array.from({ length: challenge }).map((_, i) => (
								<span
									key={i}
									className={twMerge(
										"h-full w-2 bg-green-100",
										category === "auric" && "bg-amber-100",
									)}
								></span>
							))}
							{Array.from({ length: 5 - challenge }).map((_, i) => (
								<span
									key={i}
									className={twMerge(
										"h-full w-2 border border-green-100",
										category === "auric" && "border-amber-100",
									)}
								></span>
							))}
						</div>
					</div>

					<div className="-mt-1 pr-4">
						<h2 className="font-bold !opacity-100">{name}</h2>
						<div className="-mt-1 text-xs">{zone}</div>

						<p className="relative mt-2 text-xs">{description}</p>
					</div>
				</div>

				<div className="absolute left-9 top-32 text-xs">
					{circumstance != null ? (
						<div className="flex flex-col justify-center relative h-10 text-sm text-yellow-400">
							{circumstance.name}
							<div className="absolute -left-12 h-10 w-10 border border-yellow-400 bg-gray-900 ">
								<div
									className="absolute left-0 top-0 h-[124px] w-[124px] bg-yellow-400"
									style={{
										WebkitMaskImage: `url(https://darktide-images.vercel.app/_vercel/image?q=100&w=128&url=pngs/${circumstance.icon})`,
										maskImage: `url(https://darktide-images.vercel.app/_vercel/image?q=100&w=128&url=pngs/${circumstance.icon})`,
										transformOrigin: "top left",
										transform:
											"scale(calc(40 / 124 * 0.8)) translate(10%, 10%)",
									}}
								></div>
							</div>
						</div>
					) : (
						<div className="relative h-[1.6rem]"></div>
					)}

					<div className="relative mt-2 text-sm">
						<ul
							className="flex flex-row gap-6"
							style={{
								textShadow: "black 0 0 3px",
							}}
						>
							<li>
								<span
									aria-label="Credits"
									className={twMerge(
										"absolute top-1 h-16 w-16 bg-green-100",
										category === "auric" && "bg-amber-100",
									)}
									style={{
										WebkitMaskImage: `url(${imgUrl(
											"glyphs/objective_credits.png",
											128,
										)})`,
										maskImage: `url(${imgUrl(
											"glyphs/objective_credits.png",
											128,
										)})`,
										transformOrigin: "top left",
										transform: "scale(calc(16 / 64))",
									}}
								/>
								<span className="ml-6 inline-block">
									{credits + (extraRewards?.circumstance?.credits || 0)}
								</span>

								{extraRewards?.sideMission && (
									<div className="relative -mt-1 ml-6 text-xs">
										+ {extraRewards.sideMission.credits}
									</div>
								)}
							</li>
							<li>
								<span
									aria-label="Experience"
									className={twMerge(
										"absolute top-1 h-16 w-16 bg-green-100",
										category === "auric" && "bg-amber-100",
									)}
									style={{
										WebkitMaskImage: `url(${imgUrl(
											"glyphs/objective_xp.png",
											128,
										)})`,
										maskImage: `url(${imgUrl("glyphs/objective_xp.png", 128)})`,
										transformOrigin: "top left",
										transform: "scale(calc(16 / 64))",
									}}
								/>
								<span className="ml-5 inline-block">
									{xp + (extraRewards?.circumstance?.xp || 0)}
								</span>
								{extraRewards?.sideMission && (
									<div className="relative -mt-1 ml-5 text-xs">
										+ {extraRewards.sideMission.xp}
									</div>
								)}
							</li>
						</ul>
						{sideMission ? (
							<Img
								src={`content/ui/textures/icons/pocketables/hud/small/party_${sideObjectiveToType(
									sideMission,
								)}.png`}
								width={128}
								// TODO: scripts\settings\mission_objective\templates\side_mission_objective_template.lua
								alt={""}
								className="absolute -left-12 -top-[5px] h-10 w-10 bg-gray-900 border border-solid border-gray-300 p-[5px]"
							/>
						) : (
							<div className="absolute -left-12 -top-[5px] h-10 w-10"></div>
						)}
					</div>
				</div>
				<MissionTimer start={start} end={end} />
				<div className="absolute -left-3 -top-2 h-10 w-10 bg-gray-900 p-[2px]">
					{missionTypeIcon ? (
						<Img
							width={128}
							src={missionTypeIcon + ".png"}
							className="border border-solid border-gray-300 p-1"
						/>
					) : null}
				</div>
			</div>
		</div>
	)
}
