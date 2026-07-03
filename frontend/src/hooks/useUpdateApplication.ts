import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { updateApplication as updateApplicationApi } from "../api";

export default function useUpdateApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateApplicationApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

}