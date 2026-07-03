import { useMemo, useState } from "react";

import StatusSelector from "../StatusSelector";
import PrioritySelector from "../PrioritySelector";

import useCreateApplication from "../../hooks/useCreateApplication";
import useUpdateApplication from "../../hooks/useUpdateApplication";

import type { ApplicationData, ApplicationPriority, ApplicationStatus } from "../../types";
import type { CreateApplicationParams } from "../../types/api";

import style from "./applications.module.scss";


export type ApplicationProps = (Omit<ApplicationData, "created_at"> | {
	[K in keyof ApplicationData]?: never
}) & { hide(): void; };

export default function Application(props: ApplicationProps) {
	const [status, setStatus] = useState<ApplicationStatus | undefined>(props.status);
	const [priority, setPriority] = useState<ApplicationPriority | undefined>(props.priority);

	const isEdit = useMemo(() => !!props.id, [props.id]);

	const formTitle = useMemo(() => isEdit ? "Редактирование заявки" : "Создание заявки", [isEdit]);

	const createApplication = useCreateApplication();
	const updateApplication = useUpdateApplication();

	const isLoading = useMemo(() => createApplication.isPending || updateApplication.isPending, [createApplication.isPending, updateApplication.isPending]);

	const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if(isLoading)
			return;
		const body: CreateApplicationParams = {
			title: event.target.appl_title.value,
			description: event.target.description.value || void 0,
			priority: priority || "normal",
			status: status || "new",
		};
		if(isEdit) {
			updateApplication.mutate({ id: props.id!, ...body }, {
				onSuccess: () => {
					props.hide();
				},
			});
		}
		else {
			createApplication.mutate(body, {
				onSuccess: () => {
					props.hide();
				},
			});
		}
	};

	const onReset = (event: React.SyntheticEvent<HTMLFormElement, Event>) => {
		event.preventDefault();
		props.hide();
	};

	return (
		<div>
			<h1>{ formTitle }</h1>
			<form className={ style.application } onSubmit={ onSubmit } onReset={ onReset }>
				<div className="row">
					<label htmlFor="appl_title">Название</label>
					<input id="appl_title" name="appl_title" type="text" defaultValue={ props.title } />
				</div>
				<div className="row">
					<label htmlFor="description">Описание</label>
					<textarea id="description" name="description" rows={ 4 } defaultValue={ props.description || void 0 } />
				</div>
				<div className="row">
					<label htmlFor="status">Статус</label>
					<StatusSelector
						htmlId="status"
						name="status"
						value={ status }
						setValue={ setStatus }
					/>
				</div>
				<div className="row">
					<label htmlFor="priority">Приоритет</label>
					<PrioritySelector
						htmlId="priority"
						name="priority"
						value={ priority }
						setValue={ setPriority }
					/>
				</div>

				<div className="row">
					<button
						className="button"
						type="submit"
						disabled={ isLoading }
					>
						Сохранить
					</button>
					<button
						className="button"
						type="reset"
						disabled={ isLoading }
					>
						Отмена
					</button>
				</div>
			</form>
		</div>
	);
}