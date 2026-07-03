import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import classnames from "classnames";
import {
	createColumnHelper, useReactTable, getCoreRowModel, flexRender, getPaginationRowModel,
} from "@tanstack/react-table";


import Auth from "../Auth/index.tsx";
import Application from "./Application.tsx";
import Loader from "../Utils/Loader.tsx";

import { useUser } from "../../contexts/user.tsx";

import useGetApplications from "../../hooks/useGetApplications.ts";
import useDeleteApplication from "../../hooks/useDeleteApplication.ts";

import { formatDate } from "../../utils.ts";

import style from "./applications.module.scss";

import type {
	SortingState, ColumnFiltersState, PaginationState, ColumnFilter, Header,
} from "@tanstack/react-table";
import type { ApplicationData, ApplicationPriority, ApplicationSortBy, ApplicationStatus, SortDir } from "../../types";


export default function Applications(): React.JSX.Element {

	const [applications, setApplications] = useState<ApplicationData[]>([]);
	const [sort, setSort] = useState<{ by: ApplicationSortBy, dir: SortDir; }>({ by: "create", dir: "asc" });
	const [search, setSearch] = useState<string>("");
	const [isEmpty, setEmpty] = useState<boolean>(false);
	const [isError, setError] = useState<boolean>(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [priority, setPriority] = useState<ApplicationPriority>();
	const [status, setStatus] = useState<ApplicationStatus>();
	const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
	const [deleteApplicationData, setDeleteApplicationData] = useState<ApplicationData["id"] | null>(null);


	const refApplicationDialog = useRef<HTMLDialogElement>(null);
	const refApplicationDeleteDialog = useRef<HTMLDialogElement>(null);

	const deleteApplication = useDeleteApplication();

	const { data, error, isLoading } = useGetApplications({
		priority: priority || void 0,
		status: status || void 0,
		search,
		sort_by: sort?.by,
		sort_dir: sort?.dir ? sort.dir === "asc" ? 1 : sort.dir === "desc" ? -1 : sort.dir : void 0,
		page,
		size: pageSize,
	});

	const addNewApplication = (event: React.MouseEvent) => {
		event.stopPropagation();
		refApplicationDialog.current?.showModal();
	};

	const updateApplication = (applicationData: ApplicationData) => {
		setApplicationData(applicationData);
		refApplicationDialog.current?.showModal();
	};

	const hideApplication = () => {
		setApplicationData(null);
		refApplicationDialog.current?.close();
	};

	const deleteApplicationConfirm = (applicationId: ApplicationData["id"]) => {
		setDeleteApplicationData(applicationId);
		refApplicationDeleteDialog.current?.showModal();
	};

	const onDelete = () => {
		if(typeof deleteApplicationData !== "number")
			return;
		deleteApplication.mutate(deleteApplicationData);
		hideDelete();
	};

	const hideDelete = () => {
		refApplicationDeleteDialog.current?.close();
	};

	useEffect(() => {
		if(error || !data || typeof data === "string") {
			setError(true);
			return;
		}

		setError(false);
		setApplications(data.applications);
		setEmpty(data.applications.length === 0);
		setPage(data.page);
		setPageSize(data.size);
		setTotalCount(data.total_count);
		setTotalPages(Math.ceil(data.total_count / data.size));
	}, [data, error]);

	useEffect(() => {
		function handleClick(event: MouseEvent) {
			if(refApplicationDialog.current?.open) {
				const rect = refApplicationDialog.current.getBoundingClientRect();
				const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
					rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
				if(!isInDialog)
					hideApplication();
			}

			if(refApplicationDeleteDialog.current?.open) {
				const rect = refApplicationDeleteDialog.current.getBoundingClientRect();
				const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
					rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
				if(!isInDialog)
					hideDelete();
			}
		}
		document.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("click", handleClick);
		};
	}, []);

	return (
		<div>
			<header className={ style.header }>
				<Auth />
			</header>
			<div className={ style.content }>
				<h1 className={ style.title }>Список заявок</h1>
				<div>
					<button className={ style.add } type="button" onClick={ addNewApplication }>Добавить заявку</button>
					<dialog ref={ refApplicationDialog }>
						{
							applicationData ? (
								<Application
									key={ `${ applicationData.id }` }
									{ ...applicationData }
									hide={ hideApplication }
								/>
							) : <Application key={ `new-${ Date.now() }` } hide={ hideApplication } />
						}
					</dialog>
				</div>
				<div>
					<dialog ref={ refApplicationDeleteDialog }>
						<div className={ style.application }>
							Вы уверены, что хотите удалить заявку?
							<div className="row">
								<button className="button" type="button" disabled={ deleteApplication.isPending } onClick={ onDelete }>Удалить</button>
								<button className="button" type="button" disabled={ deleteApplication.isPending } onClick={ hideDelete }>Отмена</button>
							</div>
						</div>
					</dialog>
				</div>
				<div>
					<div className={ style.search }>
						<label htmlFor="search">Поиск по названию и описанию</label>
						<Search htmlId="search" name="search" value={ search } onChange={ setSearch } />
					</div>
				</div>
				<div>
					{
						isError ? "ERROR" :
							isEmpty ? "EMPTY" :
								<Table
									applications={ applications }
									isLoading={ isLoading }
									page={ page }
									pageSize={ pageSize }
									totalCount={ totalCount }
									totalPages={ totalPages }
									priority={ priority }
									sorting={ sort }
									status={ status }
									setPage={ setPage }
									setPageSize={ setPageSize }
									setPriority={ setPriority }
									setStatus={ setStatus }
									setSorting={ setSort }

									updateApplication={ updateApplication }
									deleteApplication={ deleteApplicationConfirm }
								/>
					}

				</div>
			</div>
		</div>
	);
}

type SearchProps = {
	name: string,
	htmlId: string,
	value: string,
	onChange(value: string): void,
};

function Search(props: SearchProps): React.JSX.Element {
	return (
		<input
			id={ props.htmlId }
			name={ props.name }
			type="text"
			value={ props.value }
			onChange={ (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => props.onChange(event.target.value) }
		/>
	);
}

type ApplicationRow = ApplicationData;

const columnHelper = createColumnHelper<ApplicationRow>();

const columns = [
	columnHelper.accessor("id", {
		cell: data => <div>{ data.getValue() }</div>,
		header: () => <span>ID</span>,
		enableColumnFilter: false,
		enableSorting: false,
	}),
	columnHelper.accessor("title", {
		cell: data => <div>{ data.getValue() }</div>,
		header: () => <span>Название</span>,
		enableColumnFilter: false,
		enableSorting: true,
	}),
	columnHelper.accessor("description", {
		cell: data => <div>{ data.getValue() || null }</div>,
		header: () => <span>Описание</span>,
		enableColumnFilter: false,
		enableSorting: false,
	}),
	columnHelper.accessor("status", {
		cell: data => <div>{ data.getValue() }</div>,
		header: () => <span>Статус</span>,
		filterFn: "equalsString",
		enableColumnFilter: true,
		enableSorting: true,
	}),
	columnHelper.accessor("priority", {
		cell: data => <div>{ data.getValue() }</div>,
		header: () => <span>Приоритет</span>,
		enableColumnFilter: true,
		filterFn: "equalsString",
		enableSorting: true,
	}),
	columnHelper.accessor("created_at", {
		cell: data => <div>{ formatDate(data.getValue()) }</div>,
		header: () => <span>Дата создания</span>,
		enableColumnFilter: false,
		enableSorting: true,
	}),
];

type TableProps = {
	applications: ApplicationData[],
	isLoading: boolean,
	totalCount: number,
	totalPages: number,
	sorting?: { by: ApplicationSortBy, dir: SortDir; },
	priority?: ApplicationPriority,
	status?: ApplicationStatus,
	page: number,
	pageSize: number,
	setSorting(sort: { by: ApplicationSortBy, dir: SortDir; }): void,
	setPriority(priority?: ApplicationPriority): void,
	setStatus(status?: ApplicationStatus): void,
	setPage: React.Dispatch<React.SetStateAction<number>>;
	setPageSize(pageSize: number): void,

	updateApplication(application: ApplicationData): void,
	deleteApplication(applicationId: ApplicationData["id"]): void,
};

function Table(props: TableProps): React.JSX.Element {
	const [sorting, setSorting] = useState<SortingState>(props.sorting ?
		[{ id: props.sorting.by, desc: props.sorting.dir === -1 || props.sorting.dir === "desc" }] :
		[]
	);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
		const result: ColumnFilter[] = [];
		if(props.status)
			result.push({ id: "status", value: props.status });
		if(props.priority)
			result.push({ id: "priority", value: props.priority });
		return result;
	});
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: props.page - 1, pageSize: props.pageSize });

	const isFirstRenderSortingRef = useRef(true);
	const isFirstRenderFilterRef = useRef(true);
	const isFirstRenderPaginationRef = useRef(true);

	const { user } = useUser();

	const onEditClick = (application: ApplicationData) => {
		if(application.status === "done") {
			toast.error("Заявка уже выполнена, нельзя внести изменнеия");
			return;
		}
		props.updateApplication(application);
	};

	const onDeleteClick = (applicationId: ApplicationData["id"]) => {
		if(!user?.is_admin) {
			toast.error("Недостаточно прав");
			return;
		}

		props.deleteApplication(applicationId);
	};

	const sortToggler = (header: Header<ApplicationData, unknown>) => {
		if(header.column.getCanSort()) {
			header.column.toggleSorting(undefined, true);
		}
	};

	useEffect(() => {
		if(isFirstRenderSortingRef.current) {
			isFirstRenderSortingRef.current = false;
			return;
		}
		props.setSorting({ by: mapColumnIdToSortBy(sorting[0]?.id), dir: sorting[0]?.desc ? "desc" : "asc" });
	}, [sorting]);

	useEffect(() => {
		if(isFirstRenderFilterRef.current) {
			isFirstRenderFilterRef.current = false;
			return;
		}
		const statusFilter = columnFilters.find(filter => filter.id === "status");
		const priorityFilter = columnFilters.find(filter => filter.id === "priority");

		props.setStatus(statusFilter ? statusFilter.value as ApplicationStatus : void 0);
		props.setPriority(priorityFilter ? priorityFilter.value as ApplicationPriority : void 0);
	}, [columnFilters]);

	useEffect(() => {
		if(isFirstRenderPaginationRef.current) {
			isFirstRenderPaginationRef.current = false;
			return;
		}
		props.setPage(pagination.pageIndex + 1);
		props.setPageSize(pagination.pageSize);
	}, [pagination]);

	const table = useReactTable({
		data: props.applications,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),

		manualSorting: true,
		enableMultiSort: false,
		sortDescFirst: true,
		onSortingChange: setSorting,

		manualFiltering: true,
		onColumnFiltersChange: setColumnFilters,

		manualPagination: true,
		rowCount: props.applications.length,
		pageCount: props.totalPages,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,

		state: {
			sorting,
			pagination,
			columnFilters,
		},
	});

	if(props.isLoading)
		return <Loader />;

	return (
		<>
			<table className={ style.table }>
				<thead>
					{ table.getHeaderGroups().map((headerGroup) => (
						<tr key={ headerGroup.id }>
							{ headerGroup.headers.map((header) => (
								<th key={ header.id } className={ classnames(style.cell, style.cellHead) }>
									{ header.isPlaceholder ? null : (
										<div
											onClick={ () => sortToggler(header) }
											className={
												header.column.getCanSort() ?
													style.clickable :
													""
											}
										>
											{ flexRender(
												header.column.columnDef.header,
												header.getContext()
											) }
											{
												header.column.getCanSort() ?
													header.column.getIsSorted() === "asc" ?
														"↑" :
														header.column.getIsSorted() === "desc" ?
															"↓" :
															"" :
													undefined
											}

										</div>
									) }

								</th>
							)) }
							<th key="actions" className={ classnames(style.cell, style.cellHead) }>
								Действия
							</th>
						</tr>
					)) }
				</thead>
				<tbody className={ style.tbody }>
					{ table.getRowModel().rows.map((row) => (
						<tr key={ row.id } className={ style.tr }>
							{ row.getVisibleCells().map((cell) => (
								<td key={ cell.id } className={ style.cell }>
									{ flexRender(cell.column.columnDef.cell, cell.getContext()) }
								</td>
							)) }
							<td key={ `actions` } className={ classnames(style.cell, style.actions) }>
								<button
									className={ style.clickable }
									disabled={ row.original.status === "done" }
									onClick={ (event: React.MouseEvent) => {
										event.stopPropagation();
										onEditClick(row.original);
									} }
								>
									✏️
								</button>
								<button
									className={ style.clickable }
									disabled={ !user?.is_admin || row.original.status === "done" }
									onClick={ (event: React.MouseEvent) => {
										event.stopPropagation();
										onDeleteClick(row.original.id);
									} }
								>
									🗑️
								</button>
							</td>
						</tr>
					)) }
				</tbody>
			</table>
			<div className={ style.pagination }>
				<div>
					<label htmlFor="size">Элеменов на странице: </label>
					<select
						id="size"
						value={ props.pageSize }
						onChange={ (e) => {
							const newSize = parseInt(e.target.value);
							props.setPageSize(newSize);
						} }
					>
						<option value="5">5</option>
						<option value="10">10</option>
						<option value="25">25</option>
						<option value="50">50</option>
						<option value="100">100</option>
					</select>
				</div>
				{ props.totalPages > 0 && (
					<div className={ style.total }>
						<button
							className={ style.clickable }
							disabled={ props.page === 1 }
							onClick={ () => props.setPage(prev => Math.max(1, prev - 1)) }
						>
							Назад
						</button>
						<div style={ { display: "inline-block" } }>Страница <select
							value={ props.page }
							onChange={ (e) => {
								const newPage = parseInt(e.target.value);
								props.setPage(newPage);
							} }
						>
							{ Array.from({ length: props.totalPages }, (_, i) => i + 1).map(pg => (
								<option key={ pg } value={ pg }>{ pg }</option>
							)) }
						</select> из { props.totalPages }</div>
						<button
							className={ style.clickable }
							disabled={ props.page === props.totalPages }
							onClick={ () => props.setPage(prev => Math.min(props.totalPages, prev + 1)) }
						>
							Вперед
						</button>
					</div>
				) }
			</div>
		</>
	);
}

function mapColumnIdToSortBy(id?: string): ApplicationSortBy {
	switch(id) {
		case "status":
			return "status";
		case "priority":
			return "priority";
		case "title":
			return "title";
		case "created_at":
		default:
			return "create";
	}
}