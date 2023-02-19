export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="center-items flex gap-2 py-1">
      {tags.map((tag) => (
        <div
          key={tag}
          className="small-caps inline-block rounded bg-neutral-200 p-1.5 text-xs font-bold uppercase text-neutral-500"
        >
          {tag}
        </div>
      ))}
    </div>
  )
}
