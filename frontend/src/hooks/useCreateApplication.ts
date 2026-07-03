import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { createApplication as createApplicationApi } from "../api";

export default function useCreateApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createApplicationApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}