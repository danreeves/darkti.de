import { Link } from "@remix-run/react"
import { json } from "@remix-run/node"

export const loader = async () => {
  return json({ title: "Codex" })
}

export default function Codex() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <LinkBox to="weapons" label="Weapons" />
      {/* <LinkBox to="classes" label="Classes" /> */}
      <LinkBox to="traits" label="Traits" />
      {/* <LinkBox to="perks" label="Perks" /> */}
      <LinkBox to="skins" label="Skins" />
      <LinkBox to="curios" label="Curios" />
    </div>
  )
}

function LinkBox({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded bg-white p-4 font-heading font-black shadow hover:shadow-lg"
    >
      {label}
    </Link>
  )
}
