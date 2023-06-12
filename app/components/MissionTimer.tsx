import { useEffect, useState } from "react"
import { msToClockString } from "~/utils/msToClockString"
import { useRevalidator } from "@remix-run/react"

export function MissionTimer({ start, end }: { start: number; end: number }) {
	const [dateNow, setDateNow] = useState(Date.now())
	const revalidator = useRevalidator()

	useEffect(() => {
		const interval = setInterval(() => {
			if (Date.now() >= end) {
				revalidator.revalidate()
				return
			}
			setDateNow(Date.now())
		}, 1_000)

		return () => clearInterval(interval)
	}, [revalidator, dateNow, end])

	return (
		<div className="absolute bottom-0 right-0 flex w-full flex-row items-end justify-between">
			<div
				className={`h-2 rounded-bl bg-yellow-400`}
				style={{
					width: `calc(${(end - dateNow) / (end - start)} * (100% - 3.5rem))`,
				}}
			></div>

			<div className="flex h-6 w-14  flex-row items-center justify-center rounded-br rounded-tl bg-gray-800 text-sm text-green-50">
				<span className="tabular-nums">{msToClockString(end - dateNow)}</span>
			</div>
		</div>
	)
}
