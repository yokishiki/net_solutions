export type ApplicationStatus = "new" | "in_progress" | "done";
export type ApplicationPriority = "low" | "normal" | "high";

export type ApplicationData = {
	id: number,
	title: string,
	description?: string | null,
	status: ApplicationStatus,
	priority: ApplicationPriority,
	created_at: Date,
};

export type ApplicationSortBy = "create" | "title" | "status" | "priority";
export type SortDir = -1 | 1 | "desc" | "asc";

export type UserData = {
	id: number,
	username: string,
	is_admin?: boolean,
};