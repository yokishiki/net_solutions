import { useQuery } from "@tanstack/react-query";

import { getApplications as getApplicationsApi } from "../api";

import type { GetApplicationsParams } from "../types/api";


export default function useGetApplications(options: GetApplicationsParams) {
	return useQuery({
		queryKey: ["applications",
			options.priority, options.status, options.sort_by, options.sort_dir, options.search,
			options.page, options.size
		],
		queryFn: () => getApplicationsApi(options),
	});
}