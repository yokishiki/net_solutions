import type { ApplicationPriority } from "../../types";

type PriorityProps = {
	htmlId: string,
	name: string,
	value?: ApplicationPriority,
	setValue(priority: ApplicationPriority): void,
};

const priorityOptions: { value: ApplicationPriority, label: string; }[] = [
	{ value: "low", label: "Низкий" },
	{ value: "normal", label: "Обычный" },
	{ value: "high", label: "Высокий" },
];

export default function PrioritySelector(props: PriorityProps): React.JSX.Element {
	const onChange = (event: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
		props.setValue(event.target.value as ApplicationPriority);
	};

	return (
		<select
			id={ props.htmlId }
			name={ props.name }
			value={ props.value }
			onChange={ onChange }
		>
			{
				priorityOptions.map((option, index) => (
					<option key={ index } value={ option.value }>{ option.label }</option>
				))
			}
		</select>
	);
}