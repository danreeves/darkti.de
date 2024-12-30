export function imgUrl(
	src?: string,
	width?: number | string,
	height?: number | string,
) {
	let url = `https://cdn.darkti.de/${src}?w=${width}${
		height ? `&h=${height}` : ""
	}`

	if (!src) {
		return ""
	}

	return url
}

export function Img(props: JSX.IntrinsicElements["img"]) {
	let url = imgUrl(props.src, props.width, props.height)
	return (
		<img
			alt=""
			loading="lazy"
			{...props}
			width={undefined}
			height={undefined}
			src={url}
		/>
	)
}
