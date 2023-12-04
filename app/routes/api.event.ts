export async function action() {
	// TODO: Remember to dedupe ids from tracking urls
	// body = body.replaceAll(
	// 	/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
	// 	":id",
	// )

	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	})
}

export async function loader() {
	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	})
}
