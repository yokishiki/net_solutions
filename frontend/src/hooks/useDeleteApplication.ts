import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { deleteApplication as deleteApplicationApi } from "../api";

export default function useDeleteApplication() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteApplicationApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

}