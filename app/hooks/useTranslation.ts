import { useRouteLoaderData } from "@remix-run/react"
import { useMemo } from "react"

export function useTranslation() {
	const { localizationData } = useRouteLoaderData("root")
	const t = useMemo(
		() =>
			function t(key: string) {
				return localizationData[key] || `<localization missing: ${key}>`
			},
		[localizationData]
	)
	return t
}
