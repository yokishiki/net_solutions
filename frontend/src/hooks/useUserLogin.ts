import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { login as loginApi } from "../api";

export default function useUserLogin() {
	return useMutation({
		mutationFn: loginApi,
		onError: (error) => {
			toast.error(error.message);
		},
	});
}