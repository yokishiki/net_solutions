import type { ApplicationData, ApplicationPriority, ApplicationStatus, ApplicationSortBy, SortDir, UserData } from "./index";


export type GetApplicationsResponse = {
	applications: ApplicationData[];
	total_count: number;
	size: number;
	page: number;
	has_next: boolean;
};

export type GetApplicationsParams = {
	size?: number;
	page?: number;
	status?: ApplicationStatus,
	priority?: ApplicationPriority,
	search?: string,
	sort_by?: ApplicationSortBy,
	sort_dir?: SortDir,
};

export type CreateApplicationParams = Omit<ApplicationData, "id" | "created_at">;

export type UpdateApplicationParams = Omit<ApplicationData, "created_at">;

export type CreateApplicationResponse = ApplicationData;

export type UpdateApplicationResponse = ApplicationData;

export type LoginParams = {
	username: string, password: string,
};

export type LoginResponse = {
	user: UserData,
	token: {
		access_token: string,
		token_type: "bearer",
	};
};