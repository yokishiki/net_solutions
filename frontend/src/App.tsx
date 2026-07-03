import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import Applications from "./components/Applications";

import { UserProvider } from "./contexts/user";


const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchInterval: false,
		},
	},
});

function App() {

	return (
		<QueryClientProvider client={ queryClient }>
			<UserProvider>
				<Applications />
				<ToastContainer />
			</UserProvider>
		</QueryClientProvider>
	);
}

export default App;
