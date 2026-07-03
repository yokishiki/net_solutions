import React, { createContext, useContext, useEffect, useState } from "react";

import type { UserData } from "../types/index";

type UserContextType = {
	user?: UserData | null;
	setUser(user: UserData | null): void,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: React.ReactNode,
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [user, setUser] = useState<UserData | null>(null);

	useEffect(() => {
		const lsUser = localStorage.getItem("ns_user");
		if(lsUser) {
			try {
				setUser(JSON.parse(lsUser));
			}
			catch(err) {
				localStorage.removeItem("ns_token");
				localStorage.removeItem("ns_user");
			}
		}
	}, []);

	return (
		<UserContext.Provider value={ { user, setUser } }>
			{ children }
		</UserContext.Provider>
	);
};

export const useUser = (): UserContextType => {
	const context = useContext(UserContext);
	if(context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};