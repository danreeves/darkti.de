import { useRevalidator } from "@remix-run/react"
import { useEffect } from "react"

export function useRevalidateOnFocus() {
	let { revalidate } = useRevalidator()

	useEffect(() => {
		function onFocus() {
			revalidate()
		}
		window.addEventListener("focus", onFocus)
		return () => {
			window.removeEventListener("focus", onFocus)
		}
	}, [revalidate])

	useEffect(() => {
		function onVisibilityChange() {
			revalidate()
		}
		window.addEventListener("visibilitychange", onVisibilityChange)
		return () => {
			window.removeEventListener("visibilitychange", onVisibilityChange)
		}
	}, [revalidate])
}
