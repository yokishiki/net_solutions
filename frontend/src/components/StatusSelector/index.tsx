import type { ApplicationStatus } from "../../types";

type StatusProps = {
	htmlId: string,
	name: string,
	value?: ApplicationStatus,
	setValue(status: ApplicationStatus): void,
};

const statusOptions: { value: ApplicationStatus, label: string; }[] = [
	{ value: "new", label: "Новая" },
	{ value: "in_progress", label: "Выполняется" },
	{ value: "done", label: "Завершено" },
];

export default function StatusSelector(props: StatusProps): React.JSX.Element {
	const onChange = (event: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
		props.setValue(event.target.value as ApplicationStatus);
	};

	return (
		<select
			id={ props.htmlId }
			name={ props.name }
			value={ props.value }
			onChange={ onChange }
		>
			{
				statusOptions.map((option, index) => (
					<option key={ index } value={ option.value }>{ option.label }</option>
				))
			}
		</select>
	);
}