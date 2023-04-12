import { createCookieSessionStorage } from "@remix-run/node"

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		secrets: [process.env.SECRETSECRET!],
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	},
})

// you can also export the methods individually for your own usage
export let { getSession, commitSession, destroySession } = sessionStorage
