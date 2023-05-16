import type { z } from "zod"
import type { MissionBoardSchema } from "~/services/darktide.server"
import { useEffect, useState } from "react"
import { msToClockString } from "~/utils/msToClockString"

export function MissionTimer({
	mission,
}: {
	mission: z.infer<typeof MissionBoardSchema>["missions"][number]
}): JSX.Element {
	const [dateNow, setDateNow] = useState(Date.now())

	useEffect(() => {
		const interval = setInterval(() => {
			if (Date.now() >= Number(mission.expiry)) {
				window.location.reload()
				return
			}
			setDateNow(Date.now())
		}, 1_000)

		return () => clearInterval(interval)
	}, [dateNow, mission.expiry])

	return (
		<div className="absolute bottom-0 right-0 w-full flex flex-row justify-between items-end">
			<div
				className={`h-2 bg-yellow-400 rounded-bl`}
				style={{
					width: `calc(${
						(Number(mission.expiry) - dateNow) /
						(Number(mission.expiry) - Number(mission.start))
					} * (100% - 3.5rem))`,
				}}
			></div>

			<div className="w-14 h-6 bg-gray-800  flex flex-row justify-center items-center text-sm text-green-50 rounded-tl rounded-br">
				<span className="tabular-nums">
					{msToClockString(Number(mission.expiry) - dateNow)}
				</span>
			</div>
		</div>
	)
}
