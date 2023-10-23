import type { ReactNode } from "react"
import { createContext, useContext } from "react"

const LocaleContext = createContext<string>("")

export function LocaleProvider({
	children,
	locale,
}: {
	children: ReactNode
	locale: string
}) {
	return (
		<LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
	)
}

export default function useLocale() {
	return useContext(LocaleContext)
}
