import { useSearchParams, useSubmit } from "@remix-run/react"
import type { ReactNode } from "react"
import { Form as RemixForm } from "@remix-run/react"

type CheckboxProps = {
	value?: string
	name: string
	label: string
}
export function Checkbox({ value, name, label }: CheckboxProps) {
	const [searchParams] = useSearchParams()
	const param = searchParams.getAll(name)

	const valueProp = value ? { value } : {}

	return (
		<label htmlFor={value} className="m-2 inline-flex items-center">
			<input
				type="checkbox"
				id={value}
				name={name}
				{...valueProp}
				defaultChecked={param.includes(value ?? "on")}
				className="mr-2
                          rounded
                          border-transparent
                          bg-gray-200 text-gray-700
                          focus:border-transparent
                          focus:bg-gray-200 focus:ring-1 focus:ring-gray-500
						  focus:ring-offset-2
                        "
			/>
			{label}
		</label>
	)
}

export function TextInput({
	label,
	name,
	className,
}: {
	label: string
	name: string
	className?: string
}) {
	const [searchParams] = useSearchParams()
	const value = searchParams.get(name) ?? ""

	return (
		<label htmlFor={name} className={`flex flex-col ${className}`}>
			<span className="font-heading text-xs font-black uppercase">{label}</span>
			<input
				type="search"
				name={name}
				id={name}
				defaultValue={value}
				className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border-gray-300
					border-transparent
                    bg-white
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  "
			/>
		</label>
	)
}

export function FormGroup({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) {
	return (
		<div className="flex flex-col ">
			<div className="mx-2 font-heading text-xs font-bold uppercase">
				{label}
			</div>
			<div>{children}</div>
		</div>
	)
}

export function Form({ children }: { children: ReactNode }) {
	const submit = useSubmit()

	return (
		<RemixForm
			method="get"
			onChange={(e) => submit(e.currentTarget)}
			className="mb-2 flex flex-row items-center gap-4"
		>
			{children}
		</RemixForm>
	)
}
