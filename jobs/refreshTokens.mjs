import fetch from "node-fetch"
let domain =
	process.env.NODE_ENV === "production"
		? "https://darkti.de"
		: "http://localhost:3000"
let path = "/auth/refresh"
let groupName = "Fetched in"

console.time(groupName)

let response = await fetch(`${domain}${path}`)

if (response.ok) {
	let data = await response.json()
	console.log(data)
} else {
	console.log(response.statusText)
}

console.timeEnd(groupName)
