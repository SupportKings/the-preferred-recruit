"use client";

import { KBarProvider } from "kbar";
import { useNavigationActions } from "../actions/navigation";
import { useThemeActions } from "../actions/theme";
export const CommandProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const themeActions = useThemeActions();
	const navigationActions = useNavigationActions();

	const actions: any[] = [...navigationActions, ...themeActions];

	return (
		<KBarProvider
			actions={actions}
			options={{
				disableScrollbarManagement: true,
			}}
		>
			{children}
		</KBarProvider>
	);
};
