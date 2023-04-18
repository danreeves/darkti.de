export function Img(props: JSX.IntrinsicElements["img"]) {
	let url = `https://darktide-images.vercel.app/_vercel/image?q=100&url=pngs/${
		props.src
	}&w=${props.width}${props.height ? `&h=${props.height}` : ""}`

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
