import type {
	CreateApplicationResponse, CreateApplicationParams, GetApplicationsParams, GetApplicationsResponse,
	LoginParams, LoginResponse, UpdateApplicationParams, UpdateApplicationResponse,
} from "./types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestApiOptions = RequestOptions & {
	method?: RequestMethod;
	useFormData?: boolean;
};

type RequestOptions = {
	query?: Record<string, string | number | boolean> | null;
	body?: Record<string, unknown> | FormData | null;
	headers?: Record<string, string>;
};

type ApiResponse<T> = Promise<T>;

/**
 * Универсальный метод для выполнения HTTP-запросов
 */
async function request<T>(
	endpoint: string,
	options: RequestApiOptions = {}
): ApiResponse<T> {
	const {
		method = "GET",
		body = null,
		headers = {},
	} = options;

	const query = buildQuery(options.query);

	const url = `${ BASE_URL }${ endpoint }${ query }`;

	const requestHeaders: Record<string, string> = {
		...headers,
	};

	const isFormData = body instanceof FormData;

	if(isFormData) {
		// https://stackoverflow.com/a/39281156
		// Не проставляем заголовок, чтобы не fastapi не ругался
	}
	else if(body !== null) {
		requestHeaders["Content-Type"] = "application/json";
	}

	const config: RequestInit = {
		method,
		headers: requestHeaders,
		body: isFormData ? body as FormData : body ? JSON.stringify(body as Record<string, unknown>) : void 0,
	};

	let response: Response;
	let data: any;

	try {
		response = await fetch(url, config);
		data = await response.json();
	}
	catch(error) {
		throw error;
	}
	if(!response.ok) {
		const error = new Error(
			data && typeof data === "object" && "msg" in data && typeof data.msg === "string" ?
				data.msg :
				typeof data === "object" && "detail" in data && typeof data.detail === "string" ?
					data.detail :
					response.statusText
		);

		throw error;
	}

	return data;
}

async function get<T>(
	endpoint: string,
	options?: RequestOptions
): ApiResponse<T> {
	return request<T>(endpoint, { ...options, method: "GET" });
}

async function patch<T>(
	endpoint: string,
	options?: RequestOptions
): ApiResponse<T> {
	return request<T>(endpoint, { ...options, method: "PATCH" });
}

async function post<T>(
	endpoint: string,
	options?: RequestOptions
): ApiResponse<T> {
	return request<T>(endpoint, { ...options, method: "POST" });
}

async function remove<T>(
	endpoint: string,
	options?: RequestOptions
): ApiResponse<T> {
	return request<T>(endpoint, { ...options, method: "DELETE" });
};

function buildQuery(params?: Record<string, any> | null): string {
	if(!params || Object.keys(params).length === 0)
		return "";

	const results: string[] = [];
	for(const key in params) {
		if(typeof params[key] === "undefined")
			continue;
		results.push(`${ key }=${ String(params[key]) }`);
	}

	return "?" + results.join("&");
}

export async function getApplications(query?: GetApplicationsParams | null): ApiResponse<GetApplicationsResponse> {
	return get<GetApplicationsResponse>(`/applications`, { query });
}

export async function createApplication(body: CreateApplicationParams): ApiResponse<CreateApplicationResponse> {
	return post<CreateApplicationResponse>(`/applications`, { body });
}

export async function updateApplication(applicationData: UpdateApplicationParams): ApiResponse<UpdateApplicationResponse> {
	const { id, ...rest } = applicationData;
	return patch<CreateApplicationResponse>(`/applications/${ id }`, { body: rest });
}

export async function deleteApplication(applicationId: number): ApiResponse<void> {
	const token = localStorage.getItem("ns_token");
	const headers = token ? { "Authorization": `Bearer ${ token }` } : void 0;
	return remove<void>(`/applications/${ applicationId }`, { headers });
}

export async function login(body: LoginParams): ApiResponse<LoginResponse> {
	const formData = new FormData();
	let key: keyof LoginParams;
	for(key in body) {
		formData.append(key, body[key]);
	}

	return post<LoginResponse>(`/auth/login`, { body: formData, });
}