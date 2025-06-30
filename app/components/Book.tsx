import { Link } from "react-router"

export function Book({ className }: { className?: string }) {
	return (
		<>
			<Link
				to="/"
				className={className}
				style={{
					perspective: "1000px",
					display: "block",
					width: "88px",
					height: "88px",
				}}
			>
				<span className="sr-only">Darkti.de</span>
				<div
					className="hover-faster"
					style={{
						width: "88px",
						height: "88px",
						position: "relative",
						transformStyle: "preserve-3d",
						animation: "rotate3d 14s steps(16, end) infinite",
					}}
				>
					{Array.from({ length: 4 }).map((_, index) => (
						<img
							key={index}
							src="/content/ui/textures/icons/pocketables/hud/scripture.png"
							style={{
								filter: "grayscale(100%) sepia(100%) hue-rotate(60deg) saturate(300%) brightness(0.8)",
								position: "absolute",
								width: "88px",
								height: "88px",
								transform: `rotateY(${index * 90}deg) translateZ(24px)`,
							}}
						/>
					))}
				</div>
			</Link>
			<style>{`
			.hover-faster:hover {
				animation-duration: 1s !important;
				animation-timing-function: steps(3, end) !important;
				}
				@keyframes rotate3d {
					0% { transform: rotateY(0deg) rotateX(10deg); }
					25% { transform: rotateY(90deg) rotateX(5deg); }
					50% { transform: rotateY(180deg) rotateX(0deg); }
					75% { transform: rotateY(270deg) rotateX(5deg); }
					100% { transform: rotateY(360deg) rotateX(10deg); }
					}
					`}</style>
		</>
	)
}
