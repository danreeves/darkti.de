import { Badge } from "~/components/ui/badge"
import { titleCase } from "~/utils/titleCase"

export function TagList({ tags }: { tags: string[] }) {
	return (
		<div className="center-items flex gap-2 py-1">
			{tags.map((tag) => (
				<Badge variant="secondary" key={tag}>
					{titleCase(tag)}
				</Badge>
			))}
		</div>
	)
}
