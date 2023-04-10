export function classnames(
  ...classes: (string | boolean | null | undefined)[]
) {
  return classes.filter(Boolean).join(" ")
}
